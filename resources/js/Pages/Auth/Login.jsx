import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '../../Components/Forms/TextInput';
import ContactAdminModal from '../../Components/Common/ContactAdminModal';

const Login = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [icosphereOffset, setIcosphereOffset] = useState({ x: 0, y: 0 });

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false
  });

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
      
      // Slower parallax for icosphere (less than background)
      const ixosphereX = (e.clientX / window.innerWidth - 0.5) * 8;
      const icosphereY = (e.clientY / window.innerHeight - 0.5) * 8;
      setIcosphereOffset({ x: ixosphereX, y: icosphereY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Three.js Interactive Icosphere
  useEffect(() => {
    const container = document.getElementById('icosphere-container');
    if (!container) return;

    // Three.js setup
    const THREE = window.THREE;
    if (!THREE) {
      console.error('THREE.js not loaded');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Create low-poly icosphere
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      flatShading: true,
      shininess: 30,
      transparent: true,
      opacity: 0.3  // Much more transparent - glass-like effect
    });
    
    const icosphere = new THREE.Mesh(geometry, material);
    scene.add(icosphere);

    // Create wireframe cage
    const wireframeGeometry = new THREE.IcosahedronGeometry(2.5, 0);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff,  // Changed to white
      transparent: true,
      opacity: 0.6,  // More visible
      linewidth: 1
    });
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(wireframeGeometry),
      wireframeMaterial
    );
    scene.add(wireframe);

    // Add vertices
    const verticesGeometry = new THREE.BufferGeometry();
    const vertices = wireframeGeometry.attributes.position.array;
    verticesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const verticesMaterial = new THREE.PointsMaterial({ 
      color: 0xffffff,  // Changed to white
      size: 0.15,  // Slightly larger
      transparent: true,
      opacity: 0.8  // More visible
    });
    const points = new THREE.Points(verticesGeometry, verticesMaterial);
    scene.add(points);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight1.position.set(5, 5, 5);
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0x4488ff, 0.4);
    directionalLight2.position.set(-5, -5, -5);
    scene.add(directionalLight2);

    camera.position.z = 6;

    let targetRotationY = 0;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Slow rotation
      targetRotationY += 0.0007;
      icosphere.rotation.y = targetRotationY;
      icosphere.rotation.x = targetRotationY * 0.5;
      
      wireframe.rotation.y = targetRotationY;
      wireframe.rotation.x = targetRotationY * 0.5;
      
      points.rotation.y = targetRotationY;
      points.rotation.x = targetRotationY * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      verticesGeometry.dispose();
      verticesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <>
      <Head title="Login - CHED HEI System" />
      <div className="min-h-screen flex overflow-hidden">
        {/* Left Side - Interactive Background (Hidden on mobile, visible on desktop) */}
        <div className="hidden lg:block lg:w-2/3 relative overflow-hidden">
          {/* Parallax Background Image with More Blur */}
          <div
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              backgroundImage: 'url(/images/login_bg.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.1)`,
              filter: 'blur(5px)',
            }}
          />
          
          {/* Combined Blue Space Overlay */}
          <div className="absolute inset-0 bg-blue-900/60 dark:bg-blue-950/80" />
          <div className="absolute inset-0 bg-gray-950/40" />
          
          {/* Gradient Overlay - Depth and Drama */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/30 to-gray-950/70 dark:from-transparent dark:via-black/30 dark:to-black/80" />
          
          {/* Interactive 3D Low-Poly Icosphere with Parallax */}
          <div 
            id="icosphere-container" 
            className="absolute inset-0 transition-transform duration-300 ease-out"
            style={{
              transform: `translate(${icosphereOffset.x}px, ${icosphereOffset.y}px)`,
              filter: 'blur(0.5px)'
            }}
          />
          
          {/* 2D Floating Spheres - Companions for the icosphere */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large sphere - behind icosphere */}
            <div
              className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full bg-white/12 shadow-xl shadow-white/15 blur-xl animate-float"
              style={{ animationDelay: '0s', animationDuration: '12s' }}
            />
            
            {/* Medium sphere - upper left */}
            <div
              className="absolute top-20 left-1/4 w-32 h-32 rounded-full bg-white/18 shadow-lg shadow-white/25 blur-lg animate-float"
              style={{ animationDelay: '2s', animationDuration: '15s' }}
            />
            
            {/* Small sphere - bottom right */}
            <div
              className="absolute bottom-1/3 right-1/3 w-24 h-24 rounded-full bg-white/25 shadow-md shadow-white/35 blur-md animate-float"
              style={{ animationDelay: '4s', animationDuration: '10s' }}
            />
            
            {/* Tiny sphere - top right */}
            <div
              className="absolute top-1/3 right-1/6 w-16 h-16 rounded-full bg-white/30 shadow-sm shadow-white/40 blur-sm animate-float"
              style={{ animationDelay: '1s', animationDuration: '13s' }}
            />
            
            {/* Medium sphere - bottom left */}
            <div
              className="absolute bottom-1/4 left-1/3 w-28 h-28 rounded-full bg-white/15 shadow-lg shadow-white/20 blur-lg animate-float"
              style={{ animationDelay: '3s', animationDuration: '14s' }}
            />
            
            {/* Large ambient sphere - center background */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/8 shadow-xl shadow-white/10 blur-2xl animate-float"
              style={{ animationDelay: '5s', animationDuration: '18s' }}
            />
            
            {/* Extra small accent spheres for more life */}
            <div
              className="absolute top-1/2 left-1/4 w-14 h-14 rounded-full bg-white/28 shadow-sm shadow-white/35 animate-float"
              style={{ animationDelay: '6s', animationDuration: '11s' }}
            />
            
            <div
              className="absolute bottom-1/2 right-1/5 w-20 h-20 rounded-full bg-white/20 shadow-md shadow-white/25 blur-sm animate-float"
              style={{ animationDelay: '7s', animationDuration: '16s' }}
            />
          </div>
          
          {/* Darkening overlay for text visibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/50" />

          {/* Content Overlay - RESTORED OLD FORMAT */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-12">
            <div className="max-w-lg text-center space-y-6">
              <h2 className="text-5xl font-bold leading-tight drop-shadow-2xl">
                Empowering Education
              </h2>
              <p className="text-xl text-blue-100 dark:text-blue-200 drop-shadow-lg">
                Your gateway to comprehensive student affairs and services management
              </p>
              
              {/* Feature highlights - RESTORED */}
              <div className="mt-12 space-y-4 text-left">
                <div className="flex items-center gap-4 backdrop-blur-sm bg-white/10 dark:bg-white/5 p-4 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Access</h3>
                    <p className="text-sm text-blue-100 dark:text-blue-200">Enterprise-grade security for your data</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 backdrop-blur-sm bg-white/10 dark:bg-white/5 p-4 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Real-time Updates</h3>
                    <p className="text-sm text-blue-100 dark:text-blue-200">Stay connected with instant notifications</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 backdrop-blur-sm bg-white/10 dark:bg-white/5 p-4 rounded-xl">
                  <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Comprehensive Analytics</h3>
                    <p className="text-sm text-blue-100 dark:text-blue-200">Make data-driven decisions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form (Full width on mobile, 1/3 on desktop) */}
        <div className="w-full lg:w-1/3 flex items-center justify-center p-6 sm:p-8 bg-white dark:bg-gray-800 relative z-10 shadow-2xl">
          <div className="max-w-md w-full">
            {/* Logo and Header */}
            <div className="text-center mb-8 animate-fade-in">
              <img
                src="/images/ched_logo.png"
                alt="CHED Logo"
                className="h-20 w-20 object-contain mx-auto mb-6"
              />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                CHED SASIS Management System - IX
              </p>
            </div>

            {/* Login Form */}
            <form className="space-y-5 animate-slide-in" onSubmit={handleSubmit}>
              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                error={errors.email}
                required
                placeholder="your.email@example.com"
              />

              <TextInput
                label="Password"
                name="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                error={errors.password}
                required
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded transition-colors"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In to Your Account'
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
              Need an account?{' '}
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline"
              >
                Contact administrator
              </button>
            </p>

            <div className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
              <p>Commission on Higher Education</p>
              <p className="mt-1">Republic of the Philippines</p>
            </div>
          </div>
        </div>

        {/* Contact Admin Modal */}
        <ContactAdminModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-20px) translateX(10px); }
          66% { transform: translateY(10px) translateX(-10px); }
        }
        
        @keyframes float-3d {
          0%, 100% { transform: translateY(0px) translateZ(0px); }
          50% { transform: translateY(-30px) translateZ(50px); }
        }
        
        @keyframes rotate-3d-full {
          from { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          to { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }
        
        @keyframes rotate-3d-full-reverse {
          from { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          to { transform: rotateX(-360deg) rotateY(-360deg) rotateZ(-360deg); }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-float-3d {
          animation: float-3d 10s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Login;
