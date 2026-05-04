import os
from config import db, bcrypt, User
from flask import Flask, render_template, redirect, url_for, request
from flask_login import login_user, current_user, logout_user, login_required
import forms
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)


@app.route("/", methods = ['GET','POST'])
def index():

    if forms.RegistrationForm().validate_on_submit():
       
        #create user in db
        register_form = forms.RegistrationForm()       
        hashed_password =   bcrypt.generate_password_hash(register_form.password.data).decode('utf-8')
        user = User(username = register_form.username.data,
                    email = register_form.email.data,
                    password = hashed_password)
        db.session.add(user)
        db.session.commit()
        #Login user
        user = User.query.filter_by(
               email = forms.RegistrationForm().email.data).first()
       
        if user and bcrypt.check_password_hash(
        user.password, forms.RegistrationForm().password.data):
           
           login_user(user)
        return redirect(url_for('index'))
    
    if forms.LoginForm().validate_on_submit():
        
        login_form = forms.LoginForm()
        user = User.query.filter_by(email =  
               login_form.email.data).first()
        
        if user and bcrypt.check_password_hash(user.password, 
           login_form.password.data):
            
            #make a browser remember the username and password used to login
            login_user(user, remember = login_form.remember.data)
            
        return redirect(url_for('index'))

    if (request.method == "POST") & (request.form.get('post_header') == 'log out'):
        logout_user()
        return redirect(url_for('index'))

    return render_template("index.html",
                           login_form = forms.LoginForm(),
                           register_form = forms.RegistrationForm())


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
