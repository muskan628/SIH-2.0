import os
from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# --- App Configuration ---


app = Flask(__name__, template_folder=r"D:\xampp\htdocs\SIH-2.0\template")



# Use an environment variable for the secret key in production
app.secret_key = os.environ.get("SECRET_KEY", "a_hard_to_guess_default_secret_key")

# --- Database Configuration ---
# Format: postgresql://user:password@host:port/dbname
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost:5432/testdb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# --- Database Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), nullable=False) # 'student' or 'admin'
    username = db.Column(db.String(80), unique=True, nullable=False)
    # Increased length for the hashed password
    password = db.Column(db.String(255), nullable=False)

    def __repr__(self):
        return f'<User {self.username}>'


# --- One-Time Setup Function ---
def initial_setup():
    """Creates database tables and a default admin and student user."""
    db.create_all()
    # Check if the default admin user exists
    if not User.query.filter_by(username="admin").first():
        print("Creating default admin user...")
        # Hash the password before storing it
        hashed_password_admin = generate_password_hash("1234")
        admin = User(role="admin", username="admin", password=hashed_password_admin)
        db.session.add(admin)

    # Check if the default student user exists
    if not User.query.filter_by(username="nitin").first():
        print("Creating default student user...")
        hashed_password_student = generate_password_hash("1234")
        student = User(role="student", username="nitin", password=hashed_password_student)
        db.session.add(student)
    
    db.session.commit()
    print("Initial setup complete.")


# --- Routes ---
@app.route("/", methods=["GET", "POST"])
def login():
    """Handles user login."""
    # If user is already logged in, redirect them to their dashboard
    if "user_id" in session:
        if session.get("role") == "admin":
            return redirect(url_for("admin_dashboard"))
        return redirect(url_for("student_dashboard"))

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        role = request.form.get("role")

        user = User.query.filter_by(username=username, role=role).first()

        # Use check_password_hash to compare passwords
        if user and check_password_hash(user.password, password):
            session["user_id"] = user.id
            session["username"] = user.username
            session["role"] = user.role
            flash(f"Welcome back, {user.username}!", "success")

            if user.role == "admin":
                return redirect(url_for("admin_dashboard"))
            else:
                return redirect(url_for("student_dashboard"))
        else:
            flash("Invalid username, password, or role. Please try again.", "danger")
            return redirect(url_for("login"))

    return render_template("index.html")


@app.route("/student/dashboard")
def student_dashboard():
    """Displays the student dashboard."""
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("student-dashboard.html")


@app.route("/admin/dashboard")
def admin_dashboard():
    """Displays the admin dashboard."""
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("admin-dashboard.html")


@app.route("/logout")
def logout():
    """Logs the user out."""
    session.clear() # Clears all data from the session
    flash("You have been successfully logged out.", "info")
    return redirect(url_for("login"))


@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        role = request.form.get("role")
        username = request.form.get("username")
        email = request.form.get("email")
        password = request.form.get("password")
        confirm_password = request.form.get("confirmPassword")

        # Check password match
        if password != confirm_password:
            flash("Passwords do not match!", "danger")
            return redirect(url_for("register"))

        # Check if username/email already exists
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash("Username or Email already exists!", "danger")
            return redirect(url_for("register"))

        # Hash the password before storing
        hashed_password = generate_password_hash(password)

        # Save new user
        new_user = User(role=role, username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash("Registration successful! Please log in.", "success")
        return redirect(url_for("login"))

    return render_template("register.html")



# --- Main Execution ---
if __name__ == "__main__":
    # Create an app context to run the initial setup
    with app.app_context():
        initial_setup()
    app.run(debug=True)