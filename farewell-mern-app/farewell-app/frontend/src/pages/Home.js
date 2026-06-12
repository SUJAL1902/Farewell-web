import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Gallery from '../components/Gallery';
import Videos from '../components/Videos';
import AdminPanel from '../components/AdminPanel';
import Footer from '../components/Footer';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        
        {/* Quote Banner 1 - Before Gallery (Pictures) */}
        <div className="quote-banner container fade-up">
          <p className="quote-banner-text">How lucky I am to have something that makes saying goodbye so hard.</p>
          <span className="quote-banner-author">— A.A. Milne</span>
        </div>

        <Gallery refresh={refreshKey} />

        {/* Quote Banner 2 - Before Videos */}
        <div className="quote-banner container fade-up">
          <p className="quote-banner-text">We didn't realize we were making memories, we just knew we were having fun.</p>
          <span className="quote-banner-author">— Winnie the Pooh</span>
        </div>

        <Videos refresh={refreshKey} />
      </main>
      <Footer />
      <AdminPanel onUpload={triggerRefresh} />
    </>
  );
}
