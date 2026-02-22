import React from 'react'
import { Box } from 'lucide-react'
import Button from './ui/Button'
import { Sun, Moon } from 'lucide-react'
import { useOutletContext } from "react-router";

const Navbar = ({ isDark,toggleTheme }: { isDark: boolean;toggleTheme: () => void; }) => {
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
            <Box
              className="logo"
              style={{
                color: isDark ? '#ff2d55' : '#1a3a8f',
                stroke: isDark ? '#ff2d55' : '#1a3a8f',
                width: "34px",
                height: "34px"
              }}
            />
            <span
              className="name"
              style={{
                color: isDark ? '#ffffff' : '#111111',
                fontSize: "1.6rem",
                fontWeight: "600"
              }}
            >
              Planora
            </span>
          </div>

          <ul className="links">
            <li><a href="#upload">Product</a></li>
            <li><a href="#archive">Community</a></li>
            <li><a href="#top">Enterprise</a></li>
          </ul>
        </div>
        
        <div className="actions">
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '6px'
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
          {isSignedIn ? (
            <>
              <span className="greetings username-text" style={{ color: isDark ? '#ffffff' : '#111111' }}>
                {userName ? `Hi, ${userName}` : 'Signed in'}
              </span>
              <Button size="sm" onClick={handleAuthClick} className="btn">
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleAuthClick} size="sm" variant="ghost" style={{ color: isDark ? '#ffffff' : '#111111' }}>
                Log In
              </Button>
              <a
                href="#upload"
                className="cta"
                style={{
                  backgroundColor: isDark ? '#ff2d55' : '#2563eb',
                  color: '#ffffff'

                }}
              >
                Get Started
              </a>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar