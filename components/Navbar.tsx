import React from 'react'
import { Box } from 'lucide-react'
import Button from './ui/Button'
import { useOutletContext } from "react-router";

const Navbar = () => {
  const { isSignedIn, userName, signIn, signOut } = useOutletContext<AuthContext>()

  const handleAuthClick = async()=>{
      if(isSignedIn){
        try{
          await signOut();
        }catch(e){
          console.error(`puter sign out failed: ${e}`);
        }
        return;
      }

      try{
          await signIn();
      }catch(e){
        console.error(`puter sign in failed:${e}`);
      }
  };
  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">
              Planora
            </span>
          </div>
          <ul className="links">
            <li><a href="#">Product</a></li>
            <li><a href="#">Pricing</a></li>
            <li><a href="#">Community</a></li>
            <li><a href="#">Enterprise</a></li>
          </ul>
        </div>
        
        <div className="actions">
          {isSignedIn ? (
            <>
            <span className="greetings">
              {userName ? `Hi, ${userName}` : 'Signed in'}
            </span>
            <Button size="sm" onClick={handleAuthClick} className="btn">
              Log Out
            </Button>
            </>

          ) : (
            <>
              <Button onClick={handleAuthClick} size="sm" variant="ghost">
                Log In
              </Button>
              <a href="#upload" className="cta">Get Started</a>
            </>
          )}
          
          
        </div>
      </nav>
    </header>

  )
}

export default Navbar