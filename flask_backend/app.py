import os
from flask import Flask, render_template, request, redirect, session, flash, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.secret_key = "organize_secret_key"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///organisation.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- DATABASE MODELS ---

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50), nullable=False)
    bhag_code = db.Column(db.String(50), nullable=False) # e.g., 'B01'

class Member(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    member_id = db.Column(db.String(20), unique=True)
    reg_date = db.Column(db.String(20))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    gender = db.Column(db.String(10))
    address = db.Column(db.Text)
    city = db.Column(db.String(50))
    bhag_code = db.Column(db.String(50))   # Assigned by Admin
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    age = db.Column(db.Integer)
    occupation = db.Column(db.String(100))
    remark = db.Column(db.Text)
    
    # User-Updated Fields
    nagar_code = db.Column(db.String(50))
    basti_code = db.Column(db.String(50))
    activation = db.Column(db.String(20), default="Pending")
    activation_dt = db.Column(db.String(20))

# --- ROUTES ---

@app.route('/')
def login_page():
    return '''
    <h2>Login (Bhag Access)</h2>
    <form action="/login" method="post">
        Username: <input type="text" name="username"><br>
        Password: <input type="password" name="password"><br>
        <button type="submit">Login</button>
    </form>
    '''

@app.route('/login', methods=['POST'])
def login():
    user = User.query.filter_by(username=request.form['username'], 
                                password=request.form['password']).first()
    if user:
        session['bhag'] = user.bhag_code
        return redirect('/dashboard')
    return "Invalid Credentials"

@app.route('/dashboard')
def dashboard():
    if 'bhag' not in session: return redirect('/')
    # Filter members by the User's Bhag
    members = Member.query.filter_by(bhag_code=session['bhag']).all()
    return f"<h1>Dashboard for Bhag: {session['bhag']}</h1>" + str([(m.first_name, m.activation) for m in members])

@app.route('/update/<int:id>', methods=['POST'])
def update(id):
    member = Member.query.get(id)
    status = request.form['activation']
    member.nagar_code = request.form['nagar_code']
    member.basti_code = request.form['basti_code']
    member.activation = status
    
    if status == "Contacted":
        member.activation_dt = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    db.session.commit()
    return redirect('/dashboard')

# --- INITIALIZE DATABASE WITH MOCK DATA ---
def setup_db():
    with app.app_context():
        db.create_all()
        if not User.query.first():
            # Create a test user for Bhag B01
            test_user = User(username="admin_b01", password="password123", bhag_code="B01")
            # Create a test member in Bhag B01
            test_member = Member(member_id="M101", first_name="John", last_name="Doe", bhag_code="B01")
            db.session.add(test_user)
            db.session.add(test_member)
            db.session.commit()

if __name__ == "__main__":
    setup_db()
    app.run(debug=True)

