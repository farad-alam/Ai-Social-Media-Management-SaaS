
import { DashboardLayout } from "@/components/dashboard-layout"

export default function TermsOfServicePage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

            <div className="space-y-6 text-foreground/90">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using SocialFlowContentAi (the "Service"), you agree to comply with and be bound by these Terms of Service.
                        If you do not agree to these terms, please do not use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. Description of Service</h2>
                    <p>
                        SocialFlowContentAi provides social media request scheduling and management tools. We enable users to schedule and publish content to various social media platforms via their APIs.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. User Obligations</h2>
                    <p>
                        You agree to use the Service only for lawful purposes. You are responsible for all content you post and activity that occurs under your account.
                        You must not use the Service to post content that violates the terms of service of any connected social media platform (including Instagram, Pinterest, and TikTok).
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. Third-Party Services</h2>
                    <p>
                        Our Service integrates with third-party social media platforms. Your use of these platforms is governed by their respective terms of service and privacy policies.
                        We are not responsible for the availability or functionality of these third-party products.
                    </p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>YouTube (Google) Terms of Service</li>
                        <li>Meta (Instagram/Facebook) Terms of Service</li>
                        <li>Pinterest Terms of Service</li>
                        <li>TikTok Terms of Service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend your account access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">6. Disclaimer</h2>
                    <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis.</p>
                </section>
            </div>
        </div>
    )
}
