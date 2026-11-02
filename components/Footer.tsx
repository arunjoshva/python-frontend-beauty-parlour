import Link from "next/link";

export default function Footer(){
    return(
        <footer className="border-t border-border-soft bg-cream">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8
                text-center sm:flex-row sm:text-left md:px-10">
                {/* Brand and Description */}
                <div>
                    <Link
                        href="/"
                        className="text-lg font-semibold text-rose"
                    >
                        Jerusha Beauty Parlour
                    </Link>

                    <p className="mt-1 text-sm text-muted">
                        Where Beauty Meets Confidence
                    </p>
                </div>

                {/* Footer Navigation */}
                <nav aria-label="Footer navigation">
                    <ul className="flex flex-wrap justify-center gap-5 text-sm text-muted">
                        <li>
                            <Link
                                href="/"
                                className="text-brown transition-colors hover:text-rose"
                            >
                                Home
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/services"
                                className="text-brown font-medium transition-colors hover:text-rose"
                            >
                                Services
                            </Link>
                        </li>

                        <li>
                            <Link
                                href="/booking"
                                className="text-brown transition-colors hover:text-rose"
                            >
                                Book Appointment
                            </Link>
                        </li>
                    </ul>
                </nav>                
            </div>

            {/* Copyright */}
            <div className="border-t border-border-soft px-6 py-4 text-center text-sm text-muted">
                © 2026 <Link href="/" className="hover:text-rose">Jerusha Beauty Parlour</Link> | All Rights Reserved
            </div>
        </footer>
    );
}