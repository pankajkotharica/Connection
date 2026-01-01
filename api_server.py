"""
Flask API Server for Organization Management
Deploy this to Vercel - Vercel will auto-detect Flask
"""
from flask import Flask, request, jsonify
from supabase import create_client, Client
import os
from datetime import datetime

app = Flask(__name__)

# Initialize Supabase client
def get_supabase():
    supabase_url = os.environ.get('SUPABASE_URL', 'https://vkxuhhcyqtvigtwysjkh.supabase.co')
    supabase_key = os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZreHVoaGN5cXR2aWd0d3lzamtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5MzEzNjMsImV4cCI6MjA4MjUwNzM2M30.cOAiacDcYAVPXpzc4w8ZOxwW80LHiwaIM-3KjQSuvRs')
    return create_client(supabase_url, supabase_key)

@app.route('/api/organization/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    supabase = get_supabase()
    response = supabase.table('users').select('*').eq('username', username).eq('password', password).execute()
    
    if response.data:
        user = response.data[0]
        return jsonify({
            "success": True,
            "bhag_code": user['bhag_code']
        }), 200, {'Access-Control-Allow-Origin': '*'}
    else:
        return jsonify({
            "success": False,
            "error": "Invalid credentials"
        }), 401, {'Access-Control-Allow-Origin': '*'}

@app.route('/api/organization/dashboard', methods=['GET', 'OPTIONS'])
def dashboard():
    """Get all members for a specific bhag_code"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    bhag_code = request.args.get('bhag')
    
    if not bhag_code:
        return jsonify({"error": "Missing bhag_code parameter"}), 400, {'Access-Control-Allow-Origin': '*'}
    
    supabase = get_supabase()
    try:
        # Get members ordered by creation date (newest first)
        response = supabase.table('members').select('*').eq('bhag_code', bhag_code).order('created_at').execute()
        # Reverse to get newest first (Supabase orders ascending by default)
        response.data.reverse()
        return jsonify(response.data), 200, {'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500, {'Access-Control-Allow-Origin': '*'}

@app.route('/api/organization/members', methods=['POST', 'OPTIONS'])
def create_member():
    """Create a new member - Admin only"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    data = request.get_json()
    
    # Required fields: member_id, first_name, last_name, bhag_code
    member_data = {
        'member_id': data.get('member_id'),
        'reg_date': data.get('reg_date') or datetime.now().strftime("%Y-%m-%d"),
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'gender': data.get('gender'),
        'address': data.get('address'),
        'city': data.get('city'),
        'bhag_code': data.get('bhag_code'),  # Assigned by admin
        'email': data.get('email'),
        'phone': data.get('phone'),
        'age': data.get('age'),
        'occupation': data.get('occupation'),
        'remark': data.get('remark'),
        'activation': 'Pending',  # Default activation status
        'nagar_code': None,  # Will be updated by users
        'basti_code': None,  # Will be updated by users
        'activation_dt': None
    }
    
    supabase = get_supabase()
    try:
        response = supabase.table('members').insert(member_data).execute()
        return jsonify({"success": True, "data": response.data}), 201, {'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400, {'Access-Control-Allow-Origin': '*'}

@app.route('/api/organization/update/<int:member_id>', methods=['POST', 'OPTIONS'])
def update(member_id):
    """Update member - Users can update nagar_code, basti_code, and activation"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    data = request.get_json()
    update_data = {}
    
    # Users can update these fields
    if 'nagar_code' in data:
        update_data['nagar_code'] = data.get('nagar_code')
    if 'basti_code' in data:
        update_data['basti_code'] = data.get('basti_code')
    if 'activation' in data:
        update_data['activation'] = data.get('activation')
        # Set activation date if status is "Contacted"
        if data.get('activation') == "Contacted":
            update_data['activation_dt'] = datetime.now().strftime("%Y-%m-%d %H:%M")
        elif data.get('activation') == "Pending":
            update_data['activation_dt'] = None
    
    if not update_data:
        return jsonify({"success": False, "error": "No fields to update"}), 400, {'Access-Control-Allow-Origin': '*'}
    
    supabase = get_supabase()
    try:
        response = supabase.table('members').update(update_data).eq('id', member_id).execute()
        return jsonify({"success": True, "data": response.data}), 200, {'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400, {'Access-Control-Allow-Origin': '*'}

@app.route('/api/organization/members/<int:member_id>', methods=['GET', 'OPTIONS'])
def get_member(member_id):
    """Get a single member by ID"""
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    supabase = get_supabase()
    try:
        response = supabase.table('members').select('*').eq('id', member_id).execute()
        if response.data:
            return jsonify(response.data[0]), 200, {'Access-Control-Allow-Origin': '*'}
        else:
            return jsonify({"error": "Member not found"}), 404, {'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500, {'Access-Control-Allow-Origin': '*'}

@app.route('/api/organization/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

