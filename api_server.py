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
    response = supabase.table('members').select('*').eq('bhag_code', bhag_code).execute()
    
    return jsonify(response.data), 200, {'Access-Control-Allow-Origin': '*'}

@app.route('/api/organization/update/<int:member_id>', methods=['POST', 'OPTIONS'])
def update(member_id):
    if request.method == 'OPTIONS':
        return '', 200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    
    data = request.get_json()
    update_data = {
        'nagar_code': data.get('nagar_code'),
        'basti_code': data.get('basti_code'),
        'activation': data.get('activation')
    }
    
    if data.get('activation') == "Contacted":
        update_data['activation_dt'] = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    supabase = get_supabase()
    response = supabase.table('members').update(update_data).eq('id', member_id).execute()
    
    return jsonify({"success": True, "data": response.data}), 200, {'Access-Control-Allow-Origin': '*'}

@app.route('/api/organization/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

