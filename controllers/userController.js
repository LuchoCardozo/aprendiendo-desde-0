const {validationResult}=require("express-validator");
const bcryptjs = require("bcryptjs")
const User = require("../models/User");



const userController ={
register: (req,res)=>{
 res.render ("users/formRegister")
},
processRegister: (req,res)=>{
const resultValidation = validationResult(req)

if ( resultValidation.errors.length > 0){
    res.render ("users/formRegister", {
         errors : resultValidation.mapped(),
         oldData : req.body
        })
}

let userInDB = User.findByField('email', req.body.email);

if (userInDB) {
    return res.render("users/formRegister", {
        errors: {
            email: {
                msg: 'Este email ya está registrado'
            }
        },
        oldData: req.body
    });
}

let userToCreate = {
    ...req.body,
    password: bcryptjs.hashSync(req.body.password,10),
    image: req.file.filename
}

let userCreated = User.create(userToCreate);

return res.redirect("/users/login")
    
},

login: (req,res)=>{
    res.render ("users/formLogin")
   },

loginProcess: (req,res)=>{

	let userToLogin = User.findByField('email', req.body.email);

	if(userToLogin) {
		
			let isOkThePassword = bcryptjs.compareSync(req.body.password, userToLogin.password);
			if (isOkThePassword) {

			    delete userToLogin.password;
				req.session.userLogged = userToLogin;

		  if(req.body.remember_user) {
					res.cookie('userEmail', req.body.email, { maxAge: (1000 * 60) * 60 })
				

				return res.redirect('/users/profile');
			
				} }
				return res.render("users/formLogin", {
				errors: {
					email: {
						msg: 'Las credenciales son inválidas'
					}
				}
			});
		}

		return res.render("users/formLogin", {
			errors: {
				email: {
					msg: 'No se encuentra este email en nuestra base de datos'
				}
			}
		});
	},

profile: (req,res)=> {
		res.render("users/userProfile",{user: req.session.userLogged})
	},

logout: (req,res)=> {
	res.clearCookie("userEmail")
	req.session.destroy()
	return res.redirect("/")
}

}











module.exports = userController