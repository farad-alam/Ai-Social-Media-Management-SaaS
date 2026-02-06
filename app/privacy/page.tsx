
import { DashboardLayout } from "@/components/dashboard-layout"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-6 text-foreground/90">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            Welcome to SocialFlowContentAi ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you as to how we look after your personal data when you visit our website or use our application 
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">2. Data We Collect</h2>
          <p>
            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
            <li><strong>Social Media Data:</strong> includes data provided by social media platforms (Instagram, Pinterest, TikTok) when you connect your accounts, such as your profile information, posts, and analytics. We only access data required to perform our services (scheduling and publishing content).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Data</h2>
          <p>
            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
          </p>
          <ul className="list-disc ml-6 mt-2 space-y-1">
            <li>To provide the scheduling and publishing services you requested.</li>
            <li>To manage your account and relationship with us.</li>
            <li>To improve our website, products/services, marketing or customer relationships.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
          <p>
            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">5. Third-Party Links</h2>
          <p>
            This website may include links to third-party websites, plug-ins and applications (including Instagram, Pinterest, and TikTok). Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.
          </p>
        </section>
        
        <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
            <p>If you have any questions about this privacy policy or our privacy practices, please contact us.</p>
        </section>
      </div>
    </div>
  )
}
