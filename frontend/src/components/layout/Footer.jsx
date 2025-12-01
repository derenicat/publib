const Footer = () => {
    return (
      <footer className="bg-surface border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-secondary">
            &copy; {new Date().getFullYear()} Publib. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };
  
  export default Footer;
