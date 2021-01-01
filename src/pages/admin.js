import React from 'react'
import SignUp from '../components/formComponents/SignUp'
import ConfirmSignUp from '../components/formComponents/ConfirmSignUp'
import SignIn from '../components/formComponents/SignIn'
import Inventory from '../templates/Inventory'

//https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js#sign-up
import { Auth } from 'aws-amplify';

import { toast } from 'react-toastify';

class Admin extends React.Component {
  state = { formState: "signUp", isAdmin: false }
  toggleFormState = (formState) => {
    this.setState(() => ({ formState }))
  }
  async componentDidMount() {
    // check and update signed in state
  }
  signUp = async (form) => {
    const { username, email, password } = form
    try {
      const user = await Auth.signUp({
          username,
          password,
          attributes: {
            email,
          },
      });
      console.log({ user });
      toast("Check " + email + " for a confirmation code!", {
        position: toast.POSITION.TOP_LEFT
      })
      this.setState({ formState: "confirmSignUp" })
  } catch (error) {
    toast("Error! " + error['message'], {
      position: toast.POSITION.TOP_LEFT
    })
      console.log("Error! ", error);
  }
  }
  confirmSignUp = async (form) => {
    const { username, authcode } = form
    try {
      await Auth.confirmSignUp(username, authcode);
      toast(username + " may now sign in!", {
        position: toast.POSITION.TOP_LEFT
      })
      this.setState({ formState: "signIn" })
    } catch (error) {
      toast("Error! " + error['message'], {
        position: toast.POSITION.TOP_LEFT
      })
        console.log("Error confirming sign up: ", error);
    }

  }
  signIn = async (form) => {
    const { username, password } = form
    try {
      const user = await Auth.signIn(username, password);
      const {
        signInUserSession: {
          idToken: { payload },
        },
      } = user
      console.log({ payload })

      if (
        payload["cognito:groups"] &&
        payload["cognito:groups"].includes("Admin")
      ) {
        toast("Welcome, " + username + "!", {
          position: toast.POSITION.TOP_LEFT
        })
        this.setState({ formState: "signedIn", isAdmin: true })
      } else {
        toast("Sorry, you are not an admin!", {
          position: toast.POSITION.TOP_LEFT
        })
      }
      
    } catch (error) {
      toast("Error! " + error['message'], {
        position: toast.POSITION.TOP_LEFT
      })
      console.log("Error! ", error);
    }
  }
  signOut = async() => {
    try {
      await Auth.signOut();
      this.setState({ formState: "signUp" })
      toast("Signed out, see you soon!", {
        position: toast.POSITION.TOP_LEFT
      })
    } catch (error) {
      toast("Error! " + error['message'], {
        position: toast.POSITION.TOP_LEFT
      })
      console.log("Error! ", error);
    }
  }

  render() {
    const { formState, isAdmin } = this.state
    const renderForm = (formState, state) => {
      switch(formState) {
        case "signUp":
          return <SignUp {...state} signUp={this.signUp} toggleFormState={this.toggleFormState} />
        case "confirmSignUp":
          return <ConfirmSignUp {...state} confirmSignUp={this.confirmSignUp} />
        case "signIn":
          return <SignIn {...state} signIn={this.signIn} toggleFormState={this.toggleFormState} />
        case "signedIn":
          return isAdmin ? <Inventory {...state} signOut={this.signOut} /> : <h3>Not an admin</h3>
        default:
          return null
      }
    }
    
    return (
      <div className="flex flex-col">
        <div className="max-w-fw flex flex-col">
          <div className="pt-10">
            <h1 className="text-5xl font-light">Admin Panel</h1>
          </div>
          {
            renderForm(formState)
          }
        </div>
      </div>
    )
  }
}

export default Admin