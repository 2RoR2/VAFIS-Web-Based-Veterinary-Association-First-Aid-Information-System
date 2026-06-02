interface FooterProps {
  onNavigate: (page: string, data?: any) => void;
}

// Renders the site-wide footer with quick links, resource links, and emergency contact information.
export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-white border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="mb-3">About VAFIS</h4>
            <p className="text-sm text-muted-foreground">
              Providing reliable, veterinarian-approved first-aid guidance for pet owners.
            </p>
          </div>
          <div>
            <h4 className="mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('emergency')} className="text-muted-foreground hover:text-primary transition-colors">Emergency Guide</button></li>
              <li><button onClick={() => onNavigate('videos')} className="text-muted-foreground hover:text-primary transition-colors">Educational Videos</button></li>
              <li><button onClick={() => onNavigate('clinics')} className="text-muted-foreground hover:text-primary transition-colors">Find a Vet</button></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate('terms')} className="text-muted-foreground hover:text-primary transition-colors">Terms of Use</button></li>
              <li><button onClick={() => onNavigate('privacy')} className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</button></li>
              <li><button onClick={() => onNavigate('feedback')} className="text-muted-foreground hover:text-primary transition-colors">Contact Us</button></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3">Emergency Contacts</h4>
            <p className="text-sm text-muted-foreground mb-2">24/7 Pet Poison Helpline:</p>
            <p className="text-sm">1-800-213-6680</p>
          </div>
        </div>
        <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>(c) 2026 Veterinary Association. All rights reserved.</p>
          <p className="mt-1">
            Disclaimer: This information is for first-aid guidance only and does not replace professional veterinary care.
          </p>
        </div>
      </div>
    </footer>
  );
}
