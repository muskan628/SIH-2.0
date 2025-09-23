from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# Database URI format: postgresql://username:password@host:port/database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://your_username:your_password@localhost:5432/your_db_name'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Example Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)

@app.route("/")
def index():
    users = User.query.all()
    return f"Users: {[u.name for u in users]}"

if __name__ == "__main__":
    app.run(debug=True)
