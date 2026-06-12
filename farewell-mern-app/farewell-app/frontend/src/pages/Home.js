import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Gallery from '../components/Gallery';
import Videos from '../components/Videos';
import Quotes from '../components/Quotes';
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
        <Gallery refresh={refreshKey} />
        <Videos refresh={refreshKey} />
        <Quotes refresh={refreshKey} />
      </main>
      <Footer />
      <AdminPanel onUpload={triggerRefresh} />
    </>
  );
}
