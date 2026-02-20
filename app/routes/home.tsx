import type { Route } from "./+types/home";
import Navbar from "components/Navbar";
import Upload from "components/upload";
import Button from "components/ui/Button";
import { ArrowRight, Layers, Clock, ArrowUpRight } from "lucide-react";
import {useNavigate} from "react-router";
import {useState} from "react";
import {createProject, getProjects} from "../../lib/puter.action";
import { useRef } from 'react';
import puter from "@heyputer/puter.js";
import { useEffect } from "react";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {

  const navigate=useNavigate();
  const[projects, setProjects] = useState<DesignItem[]>([]);
  const isCreatingProjectRef = useRef(false);

  useEffect(() => {
    const setup = async () => {
      try {
        const user = await puter.auth.getUser();
        console.log("Puter user:", user);
      } catch (e) {
        console.error("Auth check failed", e);
      }
    };
  
    setup();
  }, []);

    

  const handleUploadComplete = async (base64Image: string) => {
    
        if (isCreatingProjectRef.current) return false;
        isCreatingProjectRef.current = true;
    
    try{
        
        const newId = Date.now().toString();
        const name = `Residence ${newId}`;

        const newItem = {
          id:newId, name, sourceImage: base64Image,
          renderedImage: undefined,
          timestamp: Date.now()
        }


        const saved = await createProject({ item: newItem, visibility: 'private'});

        if(!saved){
          console.error("Failed to create Project");
          return false;
        }

        setProjects((prev) => [saved, ...prev]);
        
        // Persist the base64 image data to sessionStorage before navigation
    //    sessionStorage.setItem(`image_${newId}`, base64Image);
        
        navigate(`/visualizer/${newId}`,{
          state:{
            initialImage: saved.sourceImage,
            initialRendered: saved.renderedImage || null,
            name
          }
        });
        
        return true;

    }finally {
      isCreatingProjectRef.current = false;
    }
    
  }



  useEffect(() => {
    const fetchProjects = async () => {
      const items = await getProjects();
  
      setProjects(items);
    }
  
    fetchProjects();
  }, []);




  return (
    <div className="home">
      <Navbar/>

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>
          <p>Introducing Planora v2.0</p>
        </div>
        <h1>Build beautiful spaces at the speed of thought with Planora</h1>

        <p className="subtitle">Planora is AI-first design environment that helps you visualize,render and ship architectural projects faster than ever</p>  

        <div className="actions">
            <a href="#upload" className="cta">
                Start Building <ArrowRight className="icon" />
            </a> 
            <Button variant="outline" size="lg" className="demo">
              watch Demo
            </Button>
        </div>  

        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon"/>
              </div>
              <h3>Upload your floor plan</h3>
              <p>Supports JPG, PNG, Formats up to 10MB </p>
            </div>
            
            <Upload onComplete={handleUploadComplete}/>
          </div>
        </div>
      </section>

      <section className="projects">
          <div className="section-inner">
            <div className="section-head">
              <div className="copy">
                <h2>Projects</h2>
                <p>Your latest work and shared community projects all in one place.</p>
              </div>
            </div>
          <div className="projects-grid">
            {projects.map(({id, name, renderedImage, sourceImage,timestamp})=>(
                <div key={id} className="project-card group" onClick={() =>navigate(`/visualizer/${id}`)}>
                  <div className="preview">
                    <img
                      src={renderedImage || sourceImage} 
                      alt="project"
                    />
                    <div className="badge">
                      <span>Community</span>
                    </div>
                  </div>
                  <div className="card-body">
                      <div>
                        <h3>{name}</h3>
                        <div className="meta">
                          <Clock size={12} />
                          <span>{new Date(timestamp).toLocaleDateString()}</span>
                          <span>By Ajmal Sadhiq</span>
                        </div>
                      </div>
                      <div className="arrow">
                          <ArrowUpRight size={18} />
                      </div>
                  </div>
              </div>

            ))}
            
          </div>
        </div>
      </section>
  </div>
  )
}
