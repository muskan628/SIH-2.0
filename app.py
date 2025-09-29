import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy import func
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

# --- App Configuration ---
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(
    __name__,
    template_folder="template")




# Use an environment variable for the secret key in production
app.secret_key = os.environ.get("SECRET_KEY", "a_hard_to_guess_default_secret_key")

# --- Database Configuration ---
# Format: postgresql://user:password@host:port/dbname
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost:5432/testdb'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
def generate_temp_id() -> str:
    return f"T-{uuid.uuid4().hex[:10].upper()}"


def generate_permanent_id() -> str:
    return f"S-{uuid.uuid4().hex[:12].upper()}"


# --- Database Model ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(20), nullable=False) # 'student' or 'admin'
    username = db.Column(db.String(80), unique=True, nullable=False)
    # Increased length for the hashed password
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    # Student identifiers
    temp_id = db.Column(db.String(32), unique=True, nullable=True)
    permanent_id = db.Column(db.String(32), unique=True, nullable=True)

class StudentRegistration(db.Model):
    __tablename__ = "registration_students"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)    

    def __repr__(self):
        return f'<User {self.username}>'


# --- Domain Models ---
class MSTExam(db.Model):
    __tablename__ = "mst_exams"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=True)
    config = db.Column(JSON, nullable=True)  # questions, timing etc.
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class QuizExam(db.Model):
    __tablename__ = "quiz_exams"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=True)
    config = db.Column(JSON, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class MentorForm(db.Model):
    __tablename__ = "mentor_forms"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    student_name = db.Column(db.String(120), nullable=False)
    student_roll = db.Column(db.String(50), nullable=True)
    student_contact = db.Column(db.String(20), nullable=True)
    father_name = db.Column(db.String(120), nullable=True)
    father_contact = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    stream = db.Column(db.String(100), nullable=True)
    semester = db.Column(db.String(20), nullable=True)
    pending_fees = db.Column(db.Integer, nullable=True, default=0)
    activities = db.Column(db.Text, nullable=True)
    certifications = db.Column(db.Text, nullable=True)
    teacher_name = db.Column(db.String(120), nullable=True)
    department = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ExaminationForm(db.Model):
    __tablename__ = "examination_forms"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    form_number = db.Column(db.String(50), nullable=True)
    auid = db.Column(db.String(50), nullable=False)
    student_name = db.Column(db.String(120), nullable=False)
    programme = db.Column(db.String(120), nullable=False)
    semester = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    contact = db.Column(db.String(20), nullable=True)
    father_name = db.Column(db.String(120), nullable=True)
    father_contact = db.Column(db.String(20), nullable=True)
    address = db.Column(db.Text, nullable=True)
    subjects = db.Column(db.Text, nullable=True)  # Comma-separated subjects
    exam_type = db.Column(db.String(50), nullable=True)  # Regular, Supplementary, etc.
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


# Content shared by admin to students
class Note(db.Model):
    __tablename__ = "notes"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    course = db.Column(db.String(120), nullable=True)
    subject = db.Column(db.String(120), nullable=True)
    description = db.Column(db.Text, nullable=True)
    file_url = db.Column(db.String(500), nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)


class Assignment(db.Model):
    __tablename__ = "assignments"
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    course = db.Column(db.String(120), nullable=True)
    subject = db.Column(db.String(120), nullable=True)
    description = db.Column(db.Text, nullable=True)
    file_url = db.Column(db.String(500), nullable=True)
    due_date = db.Column(db.Date, nullable=True)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)


# Attendance for linking to performance
class Attendance(db.Model):
    __tablename__ = "attendance"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    student_name = db.Column(db.String(120), nullable=True)
    uid = db.Column(db.String(64), nullable=True)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(10), nullable=False)  # Present/Absent
    subject = db.Column(db.String(120), nullable=True)
    class_name = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)


# Simple feature flags to unlock forms for students
class FeatureFlag(db.Model):
    __tablename__ = "feature_flags"
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(64), unique=True, nullable=False)  # e.g., mentor_form, examination_form
    is_unlocked = db.Column(db.Boolean, nullable=False, default=False)
    updated_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ProctoringActivity(db.Model):
    __tablename__ = "proctoring_activities"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(50), nullable=False)
    exam_id = db.Column(db.String(50), nullable=False)
    activity_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='medium')  # low, medium, high, critical
    ip_address = db.Column(db.String(45), nullable=False)
    user_agent = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    resolved = db.Column(db.Boolean, default=False)


# --- One-Time Setup Function ---
def initial_setup():
    """Creates database tables and a default admin and student user."""
    db.create_all()
    # Check if the default admin user exists
    if not User.query.filter_by(username="admin").first():
        print("Creating default admin user...")
        # Hash the password before storing it
        hashed_password_admin = generate_password_hash("shabadchahal")
        admin = User(
            role="admin",
            username="admin",
            email="admin@example.com",
            password=hashed_password_admin,
        )
        db.session.add(admin)

    # Check if the default student user exists
    if not User.query.filter_by(username="nitin").first():
        print("Creating default student user...")
        hashed_password_student = generate_password_hash("shabadchahal")
        # Assign temp/permanent IDs for default student
        student = User(
            role="student",
            username="nitin",
            email="nitin@example.com",
            password=hashed_password_student,
            temp_id=generate_temp_id(),
            permanent_id=generate_permanent_id(),
        )
        db.session.add(student)
    
    # Create a sample MST exam if none exist
    if not MSTExam.query.first():
        print("Creating sample MST exam...")
        sample_mst = MSTExam(
            title="Sample MST Exam",
            config={
                "duration": 30,
                "questions": [
                    {
                        "id": 1,
                        "question": "What is 2 + 2?",
                        "options": ["3", "4", "5", "6"],
                        "correct": "B"
                    },
                    {
                        "id": 2,
                        "question": "What is the capital of India?",
                        "options": ["Mumbai", "Delhi", "Kolkata", "Chennai"],
                        "correct": "B"
                    }
                ]
            }
        )
        db.session.add(sample_mst)
    
    # Unlock MST exams by default for testing
    mst_flag = FeatureFlag.query.filter_by(key="mst_exam").first()
    if not mst_flag:
        mst_flag = FeatureFlag(key="mst_exam", is_unlocked=True)
        db.session.add(mst_flag)
    else:
        mst_flag.is_unlocked = True
    
    db.session.commit()
    print("Initial setup complete.")


# --- Schema Assurance (simple migration) ---
def ensure_schema():
    """Ensure required tables/columns exist. Adds missing columns when feasible."""
    from sqlalchemy import inspect, text

    inspector = inspect(db.engine)

    # Ensure 'users' table has 'email' column
    if 'users' in inspector.get_table_names():
        user_columns = {col['name'] for col in inspector.get_columns('users')}
        if 'email' not in user_columns:
            # Add email column as nullable first to allow backfill
            db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(120)"))
            # Backfill email values for existing rows
            db.session.execute(text("UPDATE users SET email = CONCAT(username, '@local') WHERE email IS NULL"))
            # Add unique constraint if not exists (name guarded) and set NOT NULL
            try:
                db.session.execute(text("ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email)"))
            except Exception:
                # Constraint likely exists; ignore
                pass
            db.session.execute(text("ALTER TABLE users ALTER COLUMN email SET NOT NULL"))
            db.session.commit()

        # Add temp_id and permanent_id if missing
        user_columns = {col['name'] for col in inspector.get_columns('users')}
        if 'temp_id' not in user_columns:
            db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS temp_id VARCHAR(32) UNIQUE"))
        if 'permanent_id' not in user_columns:
            db.session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS permanent_id VARCHAR(32) UNIQUE"))
        db.session.commit()

    # Ensure 'registration_students' table exists (create_all handles creation)
    # Nothing else required here since create_all is called in initial_setup.

    # Backfill temp/permanent IDs for existing students if missing
    students_missing_ids = User.query.filter(
        User.role == 'student',
        (User.temp_id.is_(None)) | (User.permanent_id.is_(None))
    ).all()
    for s in students_missing_ids:
        if not s.temp_id:
            s.temp_id = generate_temp_id()
        if not s.permanent_id:
            s.permanent_id = generate_permanent_id()
    if students_missing_ids:
        db.session.commit()

    # Ensure new content tables exist
    db.create_all()


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

        print(f"Login attempt: username={username}, role={role}")
        
        user = User.query.filter_by(username=username, role=role).first()
        print(f"User found: {user}")
        
        if user:
            print(f"User password hash: {user.password}")
            print(f"Password check result: {check_password_hash(user.password, password)}")

        # Use check_password_hash to compare passwords
        if user and check_password_hash(user.password, password):
            session["user_id"] = user.id
            session["username"] = user.username
            session["role"] = user.role
            print(f"Login successful for user: {user.username}")
            flash(f"Welcome back, {user.username}!", "success")

            if user.role == "admin":
                return redirect(url_for("admin_dashboard"))
            else:
                return redirect(url_for("student_dashboard"))
        else:
            print(f"Login failed for user: {username}")
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


# Alias to satisfy templates linking to admin_home
@app.route("/admin/home")
def admin_home():
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
        try:
            new_user = User(
                role=role,
                username=username,
                email=email,
                password=hashed_password,
                temp_id=generate_temp_id() if role == 'student' else None,
                permanent_id=generate_permanent_id() if role == 'student' else None,
            )
            db.session.add(new_user)
            db.session.commit()
            
            print(f"User registered successfully: {username} with role {role}")
            flash("Registration successful! Please log in.", "success")
            return redirect(url_for("login"))
        except Exception as e:
            print(f"Registration error: {e}")
            db.session.rollback()
            flash(f"Registration failed: {str(e)}", "danger")
            return redirect(url_for("register"))

    return render_template("register.html")


@app.route("/test-users")
def test_users():
    """Test route to check if users exist in database"""
    users = User.query.all()
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "email": user.email,
            "temp_id": user.temp_id,
            "permanent_id": user.permanent_id
        })
    return jsonify({"users": result})


@app.route("/test-password")
def test_password():
    """Test route to check password hashing"""
    test_password = "shabadchahal"
    hashed = generate_password_hash(test_password)
    check_result = check_password_hash(hashed, test_password)
    
    # Check admin user password
    admin_user = User.query.filter_by(username="admin").first()
    admin_check = False
    if admin_user:
        admin_check = check_password_hash(admin_user.password, test_password)
    
    return jsonify({
        "test_password": test_password,
        "hashed": hashed,
        "check_result": check_result,
        "admin_user_exists": admin_user is not None,
        "admin_password_check": admin_check,
        "admin_password_hash": admin_user.password if admin_user else None
    })


@app.route("/debug-login")
def debug_login():
    """Debug page for testing login functionality"""
    return render_template("debug-login.html")


@app.route("/session-status")
def session_status():
    """Check current session status"""
    return jsonify({
        "user_id": session.get("user_id"),
        "username": session.get("username"),
        "role": session.get("role"),
        "session_keys": list(session.keys())
    })


@app.route("/test-login", methods=["POST"])
def test_login():
    """Test login endpoint"""
    username = request.form.get("username")
    password = request.form.get("password")
    role = request.form.get("role")
    
    print(f"Test login: username={username}, role={role}")
    
    user = User.query.filter_by(username=username, role=role).first()
    print(f"User found: {user}")
    
    if user:
        print(f"User password hash: {user.password}")
        password_check = check_password_hash(user.password, password)
        print(f"Password check result: {password_check}")
        
        if password_check:
            session["user_id"] = user.id
            session["username"] = user.username
            session["role"] = user.role
            print(f"Login successful for user: {user.username}")
            return jsonify({"success": True, "message": "Login successful", "user": user.username})
        else:
            return jsonify({"success": False, "message": "Invalid password"})
    else:
        return jsonify({"success": False, "message": "User not found"})


@app.route("/student/notes")
def student_notes():
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("student-notes.html")


@app.route("/api/student/me", methods=["GET"])
def api_student_me():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    user = User.query.get(session["user_id"])

    # Attendance percentage
    uid_candidates = [user.permanent_id, user.temp_id, user.username]
    q = Attendance.query.filter(Attendance.uid.in_(uid_candidates))
    total = q.count()
    present = q.filter_by(status="Present").count()
    attendance_pct = int((present / total) * 100) if total else 0

    # Get pending fees from latest mentor form if present
    latest_mentor = MentorForm.query.filter_by(student_id=user.id).order_by(MentorForm.created_at.desc()).first()
    pending_fees = latest_mentor.pending_fees if latest_mentor else 0

    data = {
        "ok": True,
        "name": user.username,
        "stream": "",
        "roll_no": user.permanent_id or user.temp_id or user.username,
        "contact": "",
        "father_name": "",
        "father_contact": "",
        "attendance": attendance_pct,
        "pending_fees": pending_fees,
        "performance": "",
        "exams": []
    }
    return jsonify(data)


@app.route("/student/performance")
def student_performance():
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("student-performance.html")


@app.route("/api/performance", methods=["GET"])
def api_performance():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    user = User.query.get(session["user_id"])
    # Attendance percentage from attendance table
    uid_candidates = [user.permanent_id, user.temp_id, user.username]
    q = Attendance.query.filter(Attendance.uid.in_(uid_candidates))
    total = q.count()
    present = q.filter_by(status="Present").count()
    attendance_pct = int((present / total) * 100) if total else 0
    # Get activities from mentor forms
    mentor_forms = MentorForm.query.filter_by(student_id=user.id).all()
    activities = []
    for form in mentor_forms:
        if form.activities:
            activities.append({
                "activity": form.activities,
                "certification": form.certifications,
                "date": str(form.created_at)
            })
    
    # Placeholder aggregates for assignments/quizzes until detailed schemas exist
    data = {
        "ok": True,
        "overall": attendance_pct,  # simplistic overall until marks integrated
        "attendance": attendance_pct,
        "assignments": 0,
        "quizzes": 0,
        "marks": [],
        "activities": activities
    }
    return jsonify(data)


@app.route("/student/updates")
def student_updates():
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("student-exam.html")


# --- Notes APIs ---
@app.route("/api/notes", methods=["GET", "POST"])
def api_notes():
    role = session.get("role")
    if request.method == "POST":
        if "user_id" not in session or role != "admin":
            return jsonify({"ok": False, "error": "Unauthorized"}), 401
        payload = request.get_json(silent=True) or {}
        rec = Note(
            title=payload.get("title") or "Untitled",
            course=payload.get("course"),
            subject=payload.get("subject"),
            description=payload.get("description"),
            file_url=payload.get("file_url"),
            created_by=session.get("user_id"),
        )
        db.session.add(rec)
        db.session.commit()
        return jsonify({"ok": True, "id": rec.id})
    # GET list for any logged in user; students consume
    items = Note.query.order_by(Note.created_at.desc()).all()
    return jsonify({
        "ok": True,
        "items": [
            {
                "id": n.id,
                "title": n.title,
                "course": n.course,
                "subject": n.subject,
                "description": n.description,
                "file_url": n.file_url,
                "created_at": str(n.created_at)
            } for n in items
        ]
    })


# --- Assignments APIs ---
@app.route("/api/assignments", methods=["GET", "POST"])
def api_assignments():
    role = session.get("role")
    if request.method == "POST":
        if "user_id" not in session or role != "admin":
            return jsonify({"ok": False, "error": "Unauthorized"}), 401
        payload = request.get_json(silent=True) or {}
        from datetime import datetime
        due = None
        due_str = payload.get("due_date")
        if due_str:
            try:
                due = datetime.strptime(due_str, "%Y-%m-%d").date()
            except Exception:
                due = None
        rec = Assignment(
            title=payload.get("title") or "Untitled",
            course=payload.get("course"),
            subject=payload.get("subject"),
            description=payload.get("description"),
            file_url=payload.get("file_url"),
            due_date=due,
            created_by=session.get("user_id"),
        )
        db.session.add(rec)
        db.session.commit()
        return jsonify({"ok": True, "id": rec.id})
    items = Assignment.query.order_by(Assignment.created_at.desc()).all()
    return jsonify({
        "ok": True,
        "items": [
            {
                "id": a.id,
                "title": a.title,
                "course": a.course,
                "subject": a.subject,
                "description": a.description,
                "file_url": a.file_url,
                "due_date": str(a.due_date) if a.due_date else None,
                "created_at": str(a.created_at)
            } for a in items
        ]
    })


# --- Exam creation APIs (admin) ---
@app.route("/api/exams/mst", methods=["POST"])
def api_create_mst_exam():
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    payload = request.get_json(silent=True) or {}
    rec = MSTExam(title=payload.get("title"), config=payload.get("config"))
    db.session.add(rec)
    db.session.commit()
    return jsonify({"ok": True, "id": rec.id})


@app.route("/api/exams/quiz", methods=["POST"])
def api_create_quiz_exam():
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    payload = request.get_json(silent=True) or {}
    rec = QuizExam(title=payload.get("title"), config=payload.get("config"))
    db.session.add(rec)
    db.session.commit()
    return jsonify({"ok": True, "id": rec.id})


@app.route("/admin/mst-exam")
def mst_exam():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("mst-exam.html")


@app.route("/student/mst-exam")
def student_mst_exam():
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    # Check if MST exams are unlocked for students
    flag = FeatureFlag.query.filter_by(key="mst_exam").first()
    if not (flag and flag.is_unlocked):
        flash("MST exams are currently locked.", "warning")
        return redirect(url_for("student_updates"))
    return render_template("mst-exam.html")


@app.route("/admin/quiz-exam")
def quiz_exam():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("quiz-exam.html")


@app.route("/student/quiz-exam")
def student_quiz_exam():
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    # Check if Quiz exams are unlocked for students
    flag = FeatureFlag.query.filter_by(key="quiz_exam").first()
    if not (flag and flag.is_unlocked):
        flash("Quiz exams are currently locked.", "warning")
        return redirect(url_for("student_updates"))
    return render_template("quiz-exam.html")


@app.route("/admin/student-record")
def student_record():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("student-record.html")


@app.route("/admin/attendance")
def admin_attendance():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("admin-attendance.html")


# --- Feature Flags & Unlocks ---
@app.route("/api/feature-flags", methods=["GET"])
def api_feature_flags():
    flags = FeatureFlag.query.all()
    return jsonify({f.key: f.is_unlocked for f in flags})


@app.route("/api/feature-flags/<key>", methods=["POST"])
def api_set_feature_flag(key):
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    payload = request.get_json(silent=True) or {}
    is_unlocked = bool(payload.get("is_unlocked", False))
    flag = FeatureFlag.query.filter_by(key=key).first()
    if not flag:
        flag = FeatureFlag(key=key, is_unlocked=is_unlocked)
        db.session.add(flag)
    else:
        flag.is_unlocked = is_unlocked
    db.session.commit()
    return jsonify({"ok": True, "key": key, "is_unlocked": flag.is_unlocked})


# --- Attendance APIs ---
@app.route("/api/attendance", methods=["POST"])
def api_save_attendance():
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    payload = request.get_json(silent=True) or {}
    class_name = payload.get("class_name")
    date_str = payload.get("date")
    subject = payload.get("subject")
    students = payload.get("students", [])
    try:
        from datetime import datetime
        date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception:
        return jsonify({"ok": False, "error": "Invalid date"}), 400
    created = []
    for s in students:
        rec = Attendance(
            student_id=None,
            student_name=s.get("name"),
            uid=s.get("uid"),
            date=date_obj,
            status=s.get("status", "Absent"),
            subject=subject,
            class_name=class_name,
        )
        db.session.add(rec)
        created.append(s.get("uid"))
    db.session.commit()
    return jsonify({"ok": True, "saved": len(created)})


@app.route("/api/attendance/me", methods=["GET"])
def api_my_attendance():
    if "user_id" not in session or session.get("role") != "student":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    user = User.query.get(session["user_id"])
    # Match by permanent_id or temp_id in uid if used; fallback by email/username if needed
    uid_candidates = [user.permanent_id, user.temp_id, user.username]
    items = Attendance.query.filter(Attendance.uid.in_(uid_candidates)).all()
    return jsonify({
        "ok": True,
        "items": [
            {
                "date": str(it.date),
                "status": it.status,
                "subject": it.subject,
                "class_name": it.class_name
            } for it in items
        ]
    })


# --- Exams visibility and listing ---
@app.route("/api/exams", methods=["GET"])
def api_exams():
    # Students see exams when unlocked; admins see always
    role = session.get("role")
    mst = MSTExam.query.order_by(MSTExam.created_at.desc()).all()
    quiz = QuizExam.query.order_by(QuizExam.created_at.desc()).all()
    flags = {f.key: f.is_unlocked for f in FeatureFlag.query.all()}
    mst_unlocked = flags.get("mst_exam", True if role == "admin" else False)
    quiz_unlocked = flags.get("quiz_exam", True if role == "admin" else False)
    def exam_to_dict(x):
        return {
            "id": x.id, 
            "title": x.title, 
            "created_at": str(x.created_at),
            "config": x.config
        }
    return jsonify({
        "ok": True,
        "mst_unlocked": mst_unlocked,
        "quiz_unlocked": quiz_unlocked,
        "mst": [exam_to_dict(x) for x in mst],
        "quiz": [exam_to_dict(x) for x in quiz],
    })


# --- Mentor/Examination forms visibility for students ---
@app.route("/api/forms/visibility", methods=["GET"])
def api_forms_visibility():
    flags = {f.key: f.is_unlocked for f in FeatureFlag.query.all()}
    return jsonify({
        "ok": True,
        "mentor_form": flags.get("mentor_form", False),
        "examination_form": flags.get("examination_form", False)
    })


@app.route("/admin/examination-form")
def examination_form():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("examination-form.html")


@app.route("/admin/mentor-form")
def mentor_form():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("mentor-form.html")


@app.route("/admin/view-mentor-forms")
def view_mentor_forms():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("view-mentor-forms.html")


@app.route("/admin/view-examination-forms")
def view_examination_forms():
    if "user_id" not in session or session.get("role") != "admin":
        flash("You must be logged in as an admin to view this page.", "warning")
        return redirect(url_for("login"))
    return render_template("view-examination-forms.html")


# Student-accessible forms if unlocked
@app.route("/student/examination-form")
def student_examination_form():
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    flag = FeatureFlag.query.filter_by(key="examination_form").first()
    if not (flag and flag.is_unlocked):
        flash("Examination form is currently locked.", "warning")
        return redirect(url_for("student_updates"))
    return render_template("examination-form.html")


@app.route("/student/mentor-form")
def student_mentor_form():
    if "user_id" not in session or session.get("role") != "student":
        flash("You must be logged in as a student to view this page.", "warning")
        return redirect(url_for("login"))
    flag = FeatureFlag.query.filter_by(key="mentor_form").first()
    if not (flag and flag.is_unlocked):
        flash("Mentor form is currently locked.", "warning")
        return redirect(url_for("student_updates"))
    return render_template("mentor-form.html")


# --- Form Submission APIs ---
@app.route("/api/mentor-form", methods=["POST"])
def api_mentor_form():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    role = session.get("role")
    # Allow admin always; allow student only if unlocked
    if role == "student":
        flag = FeatureFlag.query.filter_by(key="mentor_form").first()
        if not (flag and flag.is_unlocked):
            return jsonify({"ok": False, "error": "Mentor form locked"}), 403

    payload = request.get_json(silent=True) or {}
    
    # Create record with proper database fields
    record = MentorForm(
        student_id=session.get("user_id") if role == "student" else None,
        student_name=payload.get("studentName", ""),
        student_roll=payload.get("studentRoll", ""),
        student_contact=payload.get("studentContact", ""),
        father_name=payload.get("fatherName", ""),
        father_contact=payload.get("fatherContact", ""),
        address=payload.get("address", ""),
        stream=payload.get("stream", ""),
        semester=payload.get("semester", ""),
        pending_fees=int(payload.get("pendingFees", 0)) if payload.get("pendingFees") else 0,
        activities=payload.get("activities", ""),
        certifications=payload.get("certifications", ""),
        teacher_name=session.get("username") if role == "admin" else None,
        department=payload.get("department", ""),
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({"ok": True, "id": record.id})


@app.route("/api/examination-form", methods=["POST"])
def api_examination_form():
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401

    role = session.get("role")
    # Allow admin always; allow student only if unlocked
    if role == "student":
        flag = FeatureFlag.query.filter_by(key="examination_form").first()
        if not (flag and flag.is_unlocked):
            return jsonify({"ok": False, "error": "Examination form locked"}), 403

    payload = request.get_json(silent=True) or {}
    
    # Create record with proper database fields
    record = ExaminationForm(
        student_id=session.get("user_id") if role == "student" else None,
        form_number=payload.get("formNumber", ""),
        auid=payload.get("auid", ""),
        student_name=payload.get("studentName", ""),
        programme=payload.get("programme", ""),
        semester=payload.get("semester", ""),
        email=payload.get("email", ""),
        contact=payload.get("contact", ""),
        father_name=payload.get("fatherName", ""),
        father_contact=payload.get("fatherContact", ""),
        address=payload.get("address", ""),
        subjects=payload.get("subjects", ""),
        exam_type=payload.get("examType", "Regular"),
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({"ok": True, "id": record.id})


# --- Form Data Retrieval APIs ---
@app.route("/api/mentor-forms", methods=["GET"])
def api_get_mentor_forms():
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    
    forms = MentorForm.query.order_by(MentorForm.created_at.desc()).all()
    return jsonify({
        "ok": True,
        "forms": [
            {
                "id": form.id,
                "student_name": form.student_name,
                "student_roll": form.student_roll,
                "student_contact": form.student_contact,
                "father_name": form.father_name,
                "father_contact": form.father_contact,
                "address": form.address,
                "stream": form.stream,
                "semester": form.semester,
                "pending_fees": form.pending_fees,
                "activities": form.activities,
                "certifications": form.certifications,
                "teacher_name": form.teacher_name,
                "department": form.department,
                "created_at": str(form.created_at)
            } for form in forms
        ]
    })


@app.route("/api/examination-forms", methods=["GET"])
def api_get_examination_forms():
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    
    forms = ExaminationForm.query.order_by(ExaminationForm.created_at.desc()).all()
    return jsonify({
        "ok": True,
        "forms": [
            {
                "id": form.id,
                "form_number": form.form_number,
                "auid": form.auid,
                "student_name": form.student_name,
                "programme": form.programme,
                "semester": form.semester,
                "email": form.email,
                "contact": form.contact,
                "father_name": form.father_name,
                "father_contact": form.father_contact,
                "address": form.address,
                "subjects": form.subjects,
                "exam_type": form.exam_type,
                "created_at": str(form.created_at)
            } for form in forms
        ]
    })


# --- Proctoring APIs ---
@app.route("/api/proctoring/activity", methods=["POST"])
def api_record_proctoring_activity():
    """Record suspicious activity during exams"""
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "error": "No data provided"}), 400
    
    try:
        # Determine severity based on activity type
        activity = data.get("activity", "")
        severity = "low"
        if "page hidden" in activity.lower() or "window lost focus" in activity.lower():
            severity = "medium"
        elif "face not detected" in activity.lower() or "looking away" in activity.lower():
            severity = "high"
        elif "blocked shortcut" in activity.lower() or "right-click" in activity.lower():
            severity = "critical"
        
        # Save to database
        proctoring_activity = ProctoringActivity(
            student_id=str(session.get("user_id")),
            exam_id=data.get("examId", "unknown"),
            activity_type="suspicious_behavior",
            description=activity,
            severity=severity,
            ip_address=request.remote_addr,
            user_agent=request.headers.get("User-Agent", "")
        )
        
        db.session.add(proctoring_activity)
        db.session.commit()
        
        print(f"PROCTORING ALERT: {activity} - Severity: {severity}")
        
        return jsonify({"ok": True, "message": "Activity recorded", "severity": severity})
        
    except Exception as e:
        print(f"Error recording proctoring activity: {e}")
        db.session.rollback()
        return jsonify({"ok": False, "error": "Failed to record activity"}), 500


@app.route("/api/proctoring/status", methods=["GET"])
def api_get_proctoring_status():
    """Get proctoring status for current exam"""
    if "user_id" not in session:
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    
    # Return proctoring configuration
    return jsonify({
        "ok": True,
        "proctoring_enabled": True,
        "camera_required": True,
        "microphone_required": True,
        "face_detection": True,
        "eye_tracking": True,
        "max_warnings": 3
    })


@app.route("/admin/proctoring")
def admin_proctoring():
    """Admin proctoring dashboard"""
    if "user_id" not in session or session.get("role") != "admin":
        return redirect(url_for("login"))
    
    return render_template("admin-proctoring.html")


@app.route("/api/proctoring/activities", methods=["GET"])
def api_get_proctoring_activities():
    """Get all proctoring activities for admin"""
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    
    try:
        # Get filter parameters
        severity_filter = request.args.get("severity", "")
        status_filter = request.args.get("status", "")
        
        # Build query
        query = ProctoringActivity.query
        
        if severity_filter:
            query = query.filter(ProctoringActivity.severity == severity_filter)
        
        if status_filter == "resolved":
            query = query.filter(ProctoringActivity.resolved == True)
        elif status_filter == "unresolved":
            query = query.filter(ProctoringActivity.resolved == False)
        
        # Get activities ordered by timestamp (newest first)
        activities = query.order_by(ProctoringActivity.timestamp.desc()).limit(100).all()
        
        # Calculate stats
        total_alerts = ProctoringActivity.query.count()
        critical_alerts = ProctoringActivity.query.filter(ProctoringActivity.severity == "critical").count()
        resolved_issues = ProctoringActivity.query.filter(ProctoringActivity.resolved == True).count()
        
        return jsonify({
            "ok": True,
            "activities": [
                {
                    "id": activity.id,
                    "student_id": activity.student_id,
                    "exam_id": activity.exam_id,
                    "activity_type": activity.activity_type,
                    "description": activity.description,
                    "severity": activity.severity,
                    "resolved": activity.resolved,
                    "timestamp": activity.timestamp.isoformat(),
                    "ip_address": activity.ip_address
                } for activity in activities
            ],
            "stats": {
                "total_alerts": total_alerts,
                "critical_alerts": critical_alerts,
                "resolved_issues": resolved_issues,
                "active_students": 0  # This would need to be calculated based on active sessions
            }
        })
        
    except Exception as e:
        print(f"Error getting proctoring activities: {e}")
        return jsonify({"ok": False, "error": "Failed to get activities"}), 500


@app.route("/api/proctoring/activities/<int:activity_id>/resolve", methods=["POST"])
def api_resolve_proctoring_activity(activity_id):
    """Mark a proctoring activity as resolved"""
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    
    try:
        activity = ProctoringActivity.query.get_or_404(activity_id)
        activity.resolved = True
        db.session.commit()
        
        return jsonify({"ok": True, "message": "Activity resolved"})
        
    except Exception as e:
        print(f"Error resolving proctoring activity: {e}")
        db.session.rollback()
        return jsonify({"ok": False, "error": "Failed to resolve activity"}), 500


@app.route("/api/proctoring/settings", methods=["POST"])
def api_save_proctoring_settings():
    """Save proctoring settings"""
    if "user_id" not in session or session.get("role") != "admin":
        return jsonify({"ok": False, "error": "Unauthorized"}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({"ok": False, "error": "No data provided"}), 400
    
    try:
        # In a real implementation, you would save these settings to a database
        # For now, we'll just log them
        print(f"Proctoring settings updated: {data}")
        
        return jsonify({"ok": True, "message": "Settings saved"})
        
    except Exception as e:
        print(f"Error saving proctoring settings: {e}")
        return jsonify({"ok": False, "error": "Failed to save settings"}), 500


# --- Main Execution ---
if __name__ == "__main__":
    # Create an app context to run the initial setup
    with app.app_context():
        initial_setup()
        ensure_schema()
    app.run(debug=True)