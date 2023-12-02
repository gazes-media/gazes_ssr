import { NavLink } from "@mantine/core";
import { useLocation } from "react-router-dom";

export default function NavLinkNew({label, navigate, location, leftSection, rightSection}: { label: string, navigate: Function, location: string, leftSection: React.ReactNode, rightSection?: React.ReactNode}) {
   let currentLocation = useLocation().pathname;
   if(rightSection) return <NavLink label={label} onClick={() => navigate(location)} active={location == currentLocation} leftSection={leftSection} rightSection={rightSection} />
    return <NavLink label={label} onClick={() => navigate(location)} active={location == currentLocation} leftSection={leftSection} />
}