import {
  People,
  PeopleOutline,
  Paid,
  PaidOutlined,
  Work,
  WorkOutline,
  School,
  SchoolOutlined,
  LocalHospital,
  LocalHospitalOutlined,
  Home,
  HomeOutlined,
  Park,
  ParkOutlined,
  LocationCity,
  LocationCityOutlined,
  DirectionsBike,
  DirectionsBikeOutlined,
  Security,
  SecurityOutlined,
  Forum,
  ForumOutlined,
  DirectionsBus,
  DirectionsBusOutlined,
  AutoAwesomeMosaic,
  AutoAwesomeMosaicOutlined,
  ShoppingCart,
  ShoppingCartOutlined,
} from "@mui/icons-material";

type IconVariant = "outlined" | "filled";

/**
 * @param icon is the icon name based on SolrObject theme(?)
 * @returns the Material UI icon component corresponding to the icon name
 */
const IconMatch = (icon: string, variant: IconVariant = "outlined"): JSX.Element => {
  const normalizedIcon = icon
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\s+/g, " ");
  const iconMap: Record<string, Record<IconVariant, JSX.Element>> = {
    demographics: { outlined: <PeopleOutline />, filled: <People /> },
    "economic stability": { outlined: <PaidOutlined />, filled: <Paid /> },
    employment: { outlined: <WorkOutline />, filled: <Work /> },
    education: { outlined: <SchoolOutlined />, filled: <School /> },
    "food environment": {
      outlined: <ShoppingCartOutlined />,
      filled: <ShoppingCart />,
    },
    "health and healthcare": {
      outlined: <LocalHospitalOutlined />,
      filled: <LocalHospital />,
    },
    "health and health care": {
      outlined: <LocalHospitalOutlined />,
      filled: <LocalHospital />,
    },
    housing: { outlined: <HomeOutlined />, filled: <Home /> },
    "natural environment": { outlined: <ParkOutlined />, filled: <Park /> },
    "neighborhood and built environment": {
      outlined: <LocationCityOutlined />,
      filled: <LocationCity />,
    },
    "physical activity and lifestyle": {
      outlined: <DirectionsBikeOutlined />,
      filled: <DirectionsBike />,
    },
    safety: { outlined: <SecurityOutlined />, filled: <Security /> },
    "social and community context": { outlined: <ForumOutlined />, filled: <Forum /> },
    "transportation and infrastructure": {
      outlined: <DirectionsBusOutlined />,
      filled: <DirectionsBus />,
    },
    "composite index": {
      outlined: <AutoAwesomeMosaicOutlined />,
      filled: <AutoAwesomeMosaic />,
    },
  };

  return iconMap[normalizedIcon]?.[variant] ?? (variant === "filled" ? <AutoAwesomeMosaic /> : <AutoAwesomeMosaicOutlined />);
};

export default IconMatch;
