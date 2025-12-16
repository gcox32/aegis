import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function BackToLink({ href, pageName }: { href: string, pageName: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-1 mb-2 text-muted-foreground hover:text-foreground text-xs"
        >
            <ChevronLeft className="w-4 h-4" />
            Back to {pageName}
        </Link>
    );
}