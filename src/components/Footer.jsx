import React from 'react';

function Footer() {
  return (
    <footer className="footer flex items-center py-5">
      <div className="container">
        <div className="flex md:justify-between justify-center w-full gap-4">
          <div>
            <script>document.write(new Date().getFullYear())</script> © Tailzon
          </div>
          <div className="md:flex hidden gap-2 item-center md:justify-end">
            Design &amp; Develop by
            <a href="#" className="text-primary">
              MyraStudio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;