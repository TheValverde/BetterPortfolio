export default function Footer() {
  return (
    <footer className="bg-secondary/20 border-t border-border py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">
            {process.env.FULL_NAME || 'Your Name'}
          </p>
          <p className="text-sm">
            {process.env.TITLE || 'AI Engineer'}
          </p>
          <p className="text-sm">
            {process.env.PHONE_NUMBER || '(XXX) XXX-XXXX'}
          </p>
          <p className="text-sm">
            {process.env.WEBSITE_URL || 'yourwebsite.com'}
          </p>
        </div>
      </div>
    </footer>
  );
}
