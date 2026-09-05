import Link from "next/link";

const MobileNavbar = () => {
  return (
    <div className="w-full text-center bg-uclaBlue text-white p-4">
      <Link href="/" className="font-bold hover:opacity-50">
        uclagrades.com
      </Link>
      <div className="flex items-center justify-center gap-2 mt-2">
        <Link href="/" className="font-semibold hover:opacity-50">
          Home
        </Link>
        <Link href="/about" className="font-semibold hover:opacity-50">
          About
        </Link>
        <a
          target="blank"
          rel="noopener noreferrer"
          href="https://docs.google.com/forms/d/e/1FAIpQLSeVFPZF-0_28UPTVeZH-g2TA9gLlVvNxqDXNsIvIAMSoCJYCQ/viewform"
          className="font-semibold hover:opacity-50"
        >
          Contact
        </a>
      </div>
    </div>
  );
};

export { MobileNavbar };
