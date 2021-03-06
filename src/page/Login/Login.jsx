import { faFacebookF, faGooglePlusG } from '@fortawesome/free-brands-svg-icons';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { yupResolver } from '@hookform/resolvers/yup';
import { FacebookAuthProvider, getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as yup from "yup";
import Login2 from '../../assets/img/login2.jpg';
import { app } from '../../firebaseConfig';
import { setIsSigned, setUserInfor } from '../../redux/action/user';
import './login.scss';



const auth = getAuth(app);
const ggProvider = new GoogleAuthProvider();
const fbProvider = new FacebookAuthProvider();

const db = getFirestore(app)

const schema = yup.object({
    username: yup.string().trim().required('Username is requied'),
    password: yup.string().trim().required('Password is requied'),
    phone: yup.number().integer().positive('Invalid number').required('Phone number is requied'),
    email: yup.string().email('Invalid email').required('Email is requied')
}).required()

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });
    const onSignIn = data => console.log(data)

    const handleFbLogin = async () => {
        const res = await signInWithPopup(auth, fbProvider)
        const credential = FacebookAuthProvider.credentialFromResult(res)
        const token = credential.accessToken

        const user = res.user
        console.log(user, token);
    }

    const handleGgLogin = async () => {
        const { user } = await signInWithPopup(auth, ggProvider)

        const userId = user.providerData[0].uid
        const userDocRef = doc(db, 'users', `${userId}`)
        const docSnap = await getDoc(userDocRef)
        if (docSnap.exists()) {
            console.log(docSnap.data());
        }
        else {
            const userInfor = user.providerData[0]
            const userData = {
                ...userInfor,
                recieveAddress: [],
                orderHistory: []
            }
            addUser(userData)
        }

    }

    const addUser = async (data) => {
        await setDoc(doc(db, "users", data.uid), data);
    }

    useState(() => {
        const authChange = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userId = user.providerData[0].uid
                const userDocRef = doc(db, 'users', `${userId}`)
                const docSnap = await getDoc(userDocRef)
                const userInfor = docSnap.data()
                dispatch(setUserInfor(userInfor))
                dispatch(setIsSigned(true))
                navigate('/')
            }
        })

        return authChange
    }, [])

    return (
        <div className='Login'>
            <div className="container">
                <div className="Login-form">
                    <div className="login">
                        <h2>Sign In</h2>
                        <form onSubmit={handleSubmit(onSignIn)}>
                            <div className="label">
                                <p className="title">Username</p>
                                <div className="input">
                                    <FontAwesomeIcon icon={faUser} />
                                    <input
                                        {...register("username")}
                                        name='username'
                                        placeholder='Enter your username'
                                    />
                                </div>
                                <p className='err'>{errors.username?.message}</p>
                            </div>
                            <div className="label">
                                <p className="title">Password</p>
                                <div className="input">
                                    <FontAwesomeIcon icon={faLock} />
                                    <input
                                        type="password"
                                        {...register("password")}
                                        name='password'
                                        placeholder='Enter your password'
                                    />
                                    <p className='err'>{errors.password?.message}</p>
                                </div>
                            </div>
                            <input type="submit" value={"Sign In"} />
                        </form>
                        <div className="social">
                            <p>Or sign in with social media</p>
                            <div className="list">
                                <div className="link" onClick={handleFbLogin}>
                                    <FontAwesomeIcon icon={faFacebookF} />
                                </div>
                                <div className="link" onClick={handleGgLogin}>
                                    <FontAwesomeIcon icon={faGooglePlusG} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="img">
                        <img src={Login2} alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
