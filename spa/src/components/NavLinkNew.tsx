import { NavLink } from "@mantine/core";
import { useLocation } from "react-router-dom";

export default function NavLinkNew({label, navigate, location, leftSection}: { label: string, navigate: Function, location: string, leftSection: React.ReactNode }) {
   let currentLocation = useLocation().pathname;
    return <NavLink label={label} onClick={() => navigate(location)} active={location == currentLocation} leftSection={leftSection} />
}