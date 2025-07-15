import React, { useContext, useState } from 'react';
import { 
    Button, 
    Input, 
    InputGroup, 
    InputRightElement, 
    FormControl, 
    FormLabel,
    Link
} from '@chakra-ui/react';
import { FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import loginIllustration from '../../assets/images/LoginImage.svg';
import StyledLoginPage from './Login.Styled';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const handleTogglePassword = () => setShowPassword(!showPassword);

    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const [err, setErr] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErr('');
        setIsLoading(true);

        try {
            await login(email, pass);
            navigate('/home');
        } catch (err) {
            setErr(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <StyledLoginPage>
            <div className="login-card">
                <div className="form-section">
                    <p className="subtitle">Welcome Back Team!</p>
                    <h1 className="title">Log In</h1> 
                    <form onSubmit={handleSubmit}>
                        <FormControl id="email" mb={4}>
                            <FormLabel>Email</FormLabel>
                            <Input 
                                type="email"
                                placeholder="login@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </FormControl>
                        <FormControl id="password" isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder='Input Your Password'
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                />
                                <InputRightElement>
                                    <Button h="1.75rem" size="sm" onClick={handleTogglePassword} variant="ghost">
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        {err && <p style={{ color: 'red', marginTop: '1rem' }}>{err}</p>}
                        <Link className="forgot-password" as={RouterLink} to="/forgot-password">
                            Forgot Password?
                        </Link>
                        <Button
                            className="login-button"
                            bg="#FE7743"
                            color="white"
                            rightIcon={<FiArrowRight />}
                            _hover={{ bg: '#E46A3A' }}
                            type="submit"
                            isLoading={isLoading}
                        >
                            LOGIN
                        </Button>
                    </form>
                </div>
                <div className="image-section">
                    <img src={loginIllustration} alt="Person working on laptop" className="illustration" />
                </div>
            </div>
        </StyledLoginPage>
    );
}

export default Login;