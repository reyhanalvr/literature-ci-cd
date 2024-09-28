import React, { useState, useContext } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { Context } from '../context/Context';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { API, setToken } from '../config/config.js';
import { Formik } from 'formik';
import * as yup from 'yup';

import { ActionLoading } from './Loading';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).required(),
});

const Login = (props) => {
  const [show, setShow] = useState(false);

  const [exist, setExist] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useContext(Context);
  const history = useHistory();

  const handleSubmit = async (values) => {
    setExist('');
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { email, password } = values;

    const body = JSON.stringify({ email, password });

    try {
      setLoading(true);
      const { data } = await API.post('/login', body, config);
      console.log(data);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: data.data,
      });

      setToken(data.data.token);
      setExist(true);

      try {
        const { data } = await API.get('/validate');

        await dispatch({
          type: 'GET_USER',
          payload: data.data,
        });

        if (data.data.role === 'admin') history.push('/admin');
        else history.push('/home');
      } catch (error) {
        dispatch({
          type: 'AUTH_ERROR',
        });
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILED',
      });
      setExist(false);
    }

    setLoading(false);
  };

  return (
    <>
      <Modal
        {...props}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Body>
          <h4 className="mb-4 sign">Sign In</h4>

          <Formik
            validationSchema={schema}
            onSubmit={(values) => {
              handleSubmit(values);
            }}
            initialValues={{
              email: '',
              password: '',
            }}
          >
            {({
              handleSubmit,
              handleChange,
              values,
              touched,
              isValid,
              errors,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Form.Group controlId="email">
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    isInvalid={!!errors.email}
                    isValid={touched.email && !errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
                <InputGroup controlId="password" className="mb-3">
                  <Form.Control
                    type={show ? 'text' : 'password'}
                    placeholder="Password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    isInvalid={!!errors.password}
                    isValid={touched.password && !errors.password}
                  />
                  <InputGroup.Append>
                    <InputGroup.Text
                      id="basic-addon2"
                      onClick={() => setShow(!show)}
                      style={{ width: 46 }}
                    >
                      {show ? (
                        <AiOutlineEye size="20px" />
                      ) : (
                        <AiOutlineEyeInvisible size="20px" />
                      )}
                    </InputGroup.Text>
                  </InputGroup.Append>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </InputGroup>

                {exist === false ? (
                  <p
                    className="text-danger italic text-center"
                    style={{ fontSize: '13px' }}
                  >
                    You have entered an invalid email or password
                  </p>
                ) : (
                  <br />
                )}

                <Button variant="primary" type="submit" block>
                  {loading ? <ActionLoading /> : 'Sign In'}
                </Button>
              </Form>
            )}
          </Formik>
          <p className="account mt-3">
            Don't have an account? Click{' '}
            <span className="here" onClick={props.noAcc}>
              here
            </span>
          </p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Login;
