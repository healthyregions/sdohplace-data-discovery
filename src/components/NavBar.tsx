import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { useRouter } from "next/router";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { useAuth } from "@/components/auth/AuthProvider";

type NavLinkType = {
  title: string;
  url: string;
  target?: string;
  subitem?: boolean;
};
type Props = {
  title: string;
  dropdownElId: string;
  items: NavLinkType[];
  directLink?: string;
};
function NavDropdownButton({ title, dropdownElId, items, directLink }: Props) {
  return (
    <>
      <button
        className={`nav-button p-0 pb-3 font-light${
          directLink ? "" : " cursor-default"
        }`}

        onMouseLeave={() => {
          document.getElementById(dropdownElId).setAttribute("hidden", "");
        }}
        onMouseEnter={() => {
          document.getElementById(dropdownElId).removeAttribute("hidden");
        }}
        onClick={() => {
          if (directLink) window.location.href = directLink;
        }}
      >
        {title} <ExpandMoreIcon />
      </button>
      <ul
        id={dropdownElId}
        style={{ boxShadow: '#aaaaaa 6px 12px 16px -8px' }}
        onMouseEnter={() => {
          document.getElementById(dropdownElId).removeAttribute("hidden");
        }}
        onMouseLeave={() => {
          document.getElementById(dropdownElId).setAttribute("hidden", "");
        }}
        hidden
      >
        {items.map((item, index) => (
          <li key={index}>
            <Link href={item.url} target={item.target || ''}>
              <span>
                {item.subitem && <SubdirectoryArrowRightIcon style={{height:".9em"}} />}
              </span>
              {item.title}
              {item.target =="_blank" && <OpenInNew style={{height:".75em"}} />}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

function NavDropdownMobile({ title, dropdownElId, items }: Props) {
  return (
    <>
      <button
        className={'text-uppercase'}
        onClick={() => {
          document.getElementById(dropdownElId).toggleAttribute("hidden");
        }}
      >
        {title} <ExpandMoreIcon />
      </button>
      <ul id={dropdownElId} hidden>
        {items.map((item, index) => (
          <li key={index}>
            <Link
              className={"text-white no-underline text-base"}
              href={item.url}
            >
              {item.subitem && <SubdirectoryArrowRightIcon />}{item.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

const NavBar = (): JSX.Element => {
  const [nav, setNav] = useState(false);
  const [navBackgroundColor, setNavBackgroundColor] = useState("transparent");
  const auth = useAuth();
  const startSignIn = () => {
    void auth.login("/contribute");
  };

  const handleNav = () => {
    setNav(!nav);
  };

  useEffect(() => {
    const changeBackgroundColor = () => {
      if (window.scrollY >= 90) {
        setNavBackgroundColor("salmonpink");
      } else {
        setNavBackgroundColor("transparent");
      }
    };
    window.addEventListener("scroll", changeBackgroundColor);
  }, []);

  const router = useRouter();
  const showContributorLink = auth.isAuthenticated && auth.hasRole(auth.requiredRole);

  const aboutItems = [
    { title: "Project", url: "https://sdohplace.org/project" },
    { title: "Core Team", url: "https://sdohplace.org/team" },
    { title: "Advisory", url: "https://sdohplace.org/advisory" },
  ];

  const resourcesItems = [
    { title: "Data Discovery", url: "https://sdohplace.org/search" },
    { title: "Data Refuge", url: "https://sdohplace.org/data-refuge" },
    { title: "Community Toolkit", url: "https://toolkit.sdohplace.org" },
    { title: "SDOH Guides", url: "https://sdohplace.org/guides" },
    { title: "Call for Guides", url: "https://sdohplace.org/guides/call-for-guides", subitem: true },
    { title: "Research & Reports", url: "https://sdohplace.org/research" },
  ];

  const communityItems = [
    { title: "Fellows", url: "https://sdohplace.org/fellows" },
    { title: "Showcase", url: "https://sdohplace.org/showcase" },
    { title: "Partner Projects", url: "" },
    { title: "Butterflies Rising", url: "https://butterflies-rising.sdohplace.org/", subitem: true, target: "_blank" },
  ];

  return (
    <div
      className={`absolute left-0 top-0 w-full z-50 ease-in duration-300 bg-${navBackgroundColor}`}
    >
      <div
        className={`flex justify-between items-center 2xl:max-w-[1536px] mt-8 pl-0 pr-0 mx-auto`}
      >
        <ul className="navbar hidden min-[940px]:flex pl-[2.5%]">
          <li className={'p-0 pt-2 mr-6'}>
              <Link href="https://sdohplace.org/" style={{ padding:0, margin:0 }}>
                <Image width={40} height={40} src={'/logos/sdoh-logo-navbar-desktop.svg'} alt={'LOGO'} />
              </Link>
          </li>


          {/* Home Link */}
          <li className={`mt-4`}>
            <Link href="https://sdohplace.org/">Home</Link>
          </li>

          {/* Resources Menu */}
          <li
            className={`mt-4 ml-6 active`}
          >
            <NavDropdownButton
              title="Resources"
              dropdownElId="resources-dd"
              items={resourcesItems}
            />
          </li>

          {/* Community Menu */}
          <li
            className={`mt-4 ml-6 ${
              router.pathname == "https://sdohplace.org/fellows" ||
              router.pathname.startsWith("/showcase")
                ? "active"
                : ""
            }`}
          >
            <NavDropdownButton
              title="Community"
              dropdownElId="fellows-dd"
              items={communityItems}
            />
          </li>

          {/* Symposium Link */}
          <li
            className={`mt-4 ml-6`}
          >
            <Link href="https://symposium2025.sdohplace.org" target="_blank">Symposium</Link>
          </li>

          {/* News Link */}
          <li
            className={`mt-4 ml-6 ${router.pathname.startsWith("/news") ? "active" : ""}`}
          >
            <Link href="https://sdohplace.org/news">News</Link>
          </li>

          {/* About Menu */}
          <li
            className={`mt-4 ml-4 ${
              router.pathname.startsWith("https://sdohplace.org/about") ||
              router.pathname.startsWith("https://sdohplace.org/advisory")
                ? "active"
                : ""
            }`}
          >
            <NavDropdownButton
              title="About"
              dropdownElId="about-dd"
              items={aboutItems}
            />
          </li>

          {/* Contact Us Link */}
          <li
            className={`mt-4 ml-4 ${
              router.pathname.startsWith("https://sdohplace.org/contact") ? "active" : ""
            }`}
          >
            <Link href="https://sdohplace.org/contact">Contact Us</Link>
          </li>
        </ul>

        <div className="hidden min-[940px]:flex items-center pr-[2.5%] pt-4">
          {showContributorLink && (
            <Link
              href="/contribute"
              className={`mr-6 text-base font-bold no-underline ${
                router.pathname === "/contribute" ? "text-frenchviolet" : "text-almostblack"
              }`}
            >
              Contribute
            </Link>
          )}
          {auth.isAuthenticated ? (
            <button
              type="button"
              className="border-none bg-transparent p-0 text-base font-bold text-almostblack"
              onClick={() => auth.signOut()}
            >
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              className={`text-base font-bold no-underline ${
                router.pathname === "/sign-in" ? "text-frenchviolet" : "text-almostblack"
              }`}
              onClick={startSignIn}
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Button - hidden, triggered from MobileHeader */}
        <div
          onClick={handleNav}
          className="hidden min-[940px]:hidden pl-[25px] z-50"
          id="navbar-mobile-trigger"
        >
          {nav ? (
              <AiOutlineClose size={35} color={"white"} className={'animate-fade-in'} />
          ) : (
              <AiOutlineMenu size={35} className={'animate-fade-in'} />
          )}
        </div>

        {/* Mobile Menu */}
        <div
          className={`min-[940px]:hidden absolute ${
            nav ? "left-0" : "left-[-100%]"
          } top-0 bottom-0 right-0 pt-100 flex justify-center items-baseline w-full
          h-screen bg-frenchviolet ease-in duration-300 `}
        >
          <ul className="navbar-mobile">
            <li className="flex justify-between items-center w-full pr-4">
              <Link href="/">
                <Image width={150} height={75} src={'./logos/sdoh-logo-navbar-mobile.svg'} alt={'LOGO'} />
              </Link>
              <button
                onClick={handleNav}
                className="p-2 bg-transparent border-none cursor-pointer"
                aria-label="Close menu"
              >
                <AiOutlineClose size={28} color="white" />
              </button>
            </li>

            {/* Resources Menu */}
            <li>
              <NavDropdownMobile
                title="Resources"
                dropdownElId="resources-dd-mobile"
                items={resourcesItems}
              />
            </li>
            <li>
              <NavDropdownMobile
                title="About"
                dropdownElId="about-dd-mobile"
                items={aboutItems}
              />
            </li>

            {/* Community Menu */}
            <li>
              <NavDropdownMobile
                title="Community"
                dropdownElId="fellows-dd-mobile"
                items={communityItems}
              />
            </li>

            {/* Symposium Link */}
            <li className={'text-uppercase'}>
              <Link href="https://symposium2025.sdohplace.org" target="_blank">Symposium</Link>
            </li>

            {/* News Link */}
            <li className={'text-uppercase'}>
              <Link href="https://sdohplace.org/news">News</Link>
            </li>

            {/* About Menu */}
            <li>
              <NavDropdownMobile
                title="About"
                dropdownElId="about-dd-mobile"
                items={aboutItems}
              />
            </li>

            {/* Contact Us Link */}
            <li className={'text-uppercase'}>
              <Link href="https://sdohplace.org/contact">Contact Us</Link>
            </li>
            {showContributorLink && (
              <li>
                <Link className={"text-white no-underline text-base"} href="/contribute">
                  Contribute
                </Link>
              </li>
            )}
            <li>
              {auth.isAuthenticated ? (
                <button
                  type="button"
                  className="border-none bg-transparent p-0 text-base font-bold text-white"
                  onClick={() => auth.signOut()}
                >
                  Sign Out
                </button>
              ) : (
                <button
                  type="button"
                  className="border-none bg-transparent p-0 text-base font-bold text-white"
                  onClick={startSignIn}
                >
                  Sign In
                </button>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
