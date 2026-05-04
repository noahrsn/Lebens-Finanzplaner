from flask_wtf import FlaskForm
from wtforms import (StringField, PasswordField, SubmitField,              
                     BooleanField)
from wtforms.validators import DataRequired, Length, Email, EqualTo

class RegistrationForm(FlaskForm):
    username = StringField('Username',
                           validators=[DataRequired(), 
                           Length(min=2, max=20)])
    email = StringField('Email',
                        validators=[DataRequired(), 
                        Email()])
    password = PasswordField('Password',
                             validators=[DataRequired()])
    confirm_password = PasswordField('Confirm Password',
                                     validators=[DataRequired(),
                                     EqualTo('password')])
    submit = SubmitField('Sign Up')

class LoginForm(FlaskForm):
    email = StringField('Email',
                        validators = [DataRequired(),
                        Email()])
    password = PasswordField('Password',
                             validators = [DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

# Code for frontend:
# <form method="POST" action="">
#   {{ register_form.hidden_tag() }}
#     {{ register_form.username( placeholder = "Username") }}
#     {{ register_form.email( placeholder = "Email") }}
#     {{ register_form.password( placeholder = "Password") }}
#     {{ register_form.confirm_password( placeholder = "Confirm Password") }}
#     {{ register_form.submit() }}
# </form>
#Login
# <form method="POST" action="">
#   {{ login_form.hidden_tag() }}
#     {{ login_form.email(placeholder = "Email") }}
#     {{ login_form.password(placeholder = "Password") }}
#     {{ login_form.submit() }}
# </form>
#Logout
# <form method="post">
#   <input type="hidden" name="csrf_token" value="{{csrf_token()}}"/>
#   <input type="hidden" name="post_header" value="log out">
#   <input type="submit"  value="Logout">
# </form>