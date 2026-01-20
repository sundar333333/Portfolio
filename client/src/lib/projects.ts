export interface Project {
  id: number;
  title: string;
  description: string;
  prototypeLink: string;
  posterImage: string;
  caseStudyImage: string;
  accentColor: string;
}

export const projects: Project[] = [
  {
    id: 1,
    title: "Current Mobile Payment Application",
    description: "Fintech app for seamless payments.",
    prototypeLink: "https://www.figma.com/proto/X2aLrgd5gJgeOqUe0Zev0g/Current-Mobile-Application?page-id=&node-id=1-2&p=f&viewport=-2275%2C-77%2C0.19&t=vnBMzoENrwZX76NQ-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=1%3A2",
    posterImage: "/assets/project1.jpg",
    caseStudyImage: "/attached_assets/Payment_Mobile_Application_1768933163599.png",
    accentColor: "#9333ea",
  },
  {
    id: 2,
    title: "Eventify",
    description: "Event management and booking platform.",
    prototypeLink: "https://www.figma.com/proto/E0UkE8bSkMkmrzHQpQ0bja/Eventify?page-id=0%3A1&node-id=1-348&viewport=-408%2C384%2C0.14&t=dDMe8vcPNoosO04e-1&scaling=min-zoom&content-scaling=fixed",
    posterImage: "/assets/project2.jpg",
    caseStudyImage: "/attached_assets/Eventify_Casestudy_1768933153047.png",
    accentColor: "#ec4899",
  },
  {
    id: 3,
    title: "Space Jump Mobile Game",
    description: "Interactive mobile gaming experience.",
    prototypeLink: "https://www.figma.com/proto/PvpmcEleGl8cP8i8OUu17Y/Quick-Tap-Challenge-Game-Space-Jump?page-id=0%3A1&node-id=1-336&viewport=71%2C-830%2C0.49&t=QIhsLmvyQWXHWCx1-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=1%3A353",
    posterImage: "/assets/project3.jpg",
    caseStudyImage: "/attached_assets/Space_jump_casestudy_1768933133429.png",
    accentColor: "#22c55e",
  },
  {
    id: 4,
    title: "Ticking Movie Booking Application",
    description: "UI/UX for cinema ticket reservations.",
    prototypeLink: "https://www.figma.com/proto/gwrjwJGdf0Dpham1cpp73z/Ticking-Movies-booking-Application?page-id=0%3A1&node-id=14-88&viewport=754%2C60%2C0.06&t=xm3zSz2zQ8GNlbKE-1&scaling=scale-down&content-scaling=fixed&starting-point-node-id=12%3A52",
    posterImage: "/assets/project4.jpg",
    caseStudyImage: "/attached_assets/Ticking_Movie_Booking_Application_Case_Study2_1768933142008.png",
    accentColor: "#f97316",
  },
];
