// src/routes.tsx
import { RouteObject } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadProfilePicture from "./pages/UploadProfilePicture";
// Import other pages as needed
import ProtectedRoute from "./components/ProtectedRoute";
import FreelancerProfile from "./pages/FreelancerProfile";
import PostService from "./pages/PostService";
import PostJob from "./pages/PostJob";
import EmployerJobs from "./pages/EmployerJobs";
import FreelancerServices from "./pages/FreelancerServices";
import EditService from "./pages/EditService";
import FreelancerBid from "./pages/FreelancerBid";
import EmployerJobBids from "./pages/EmployerJobBids";
import EditJob from "./pages/EditJob";
import CreateContract from "./pages/CreateContract";
import ContractDetail from "./pages/ContractDetail";
import MyContracts from "./pages/MyContracts";
import MilestoneDashboard from "./pages/MilestoneDashboard";
import CreateMilestone from "./pages/CreateMilestone";
import MilestoneDetail from "./pages/MilestoneDetail";
import RechargePage from "./pages/RechargePage";

const routes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  
  {
    element: <ProtectedRoute />, // No role restriction
    children: [
      { path: "/", element: <Home /> },
      { path: "/upload-profile-picture", element: <UploadProfilePicture /> },
      { path: "/profile/:id", element: <FreelancerProfile /> },
      { path: "/my-contracts", element: <MyContracts /> },
      { path: "/contract/:contractId", element: <ContractDetail /> },
      { path: "/contract/:contractId/milestones", element: <MilestoneDashboard /> },
      { path: "/milestone-detail/:id", element: <MilestoneDetail /> },
      { path: "/recharge", element: <RechargePage /> },
      // Add other pages available to all authenticated users
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={["EMPLOYER"]} />,
    children: [
      { path: "/post-job", element: <PostJob /> },
      { path: "/employer-jobs", element: <EmployerJobs /> },
      { path: "/job-bids/:id", element: <EmployerJobBids /> },
      { path: "/edit-job/:id", element: <EditJob /> },
      { path: "/create-contract/:bidId", element: <CreateContract /> },
      { path: "/create-milestone/:contractId", element: <CreateMilestone /> },
      // { path: "/employer-dashboard", element: <EmployerDashboard /> },
    ],
  },

  {
    element: <ProtectedRoute allowedRoles={["FREELANCER"]} />,
    children: [
      { path: "/post-service", element: <PostService /> },
      { path: "/my-services", element: <FreelancerServices /> },
      { path: "/edit-service/:id", element: <EditService /> },
      { path: "/bid-job/:id", element: <FreelancerBid /> },
      // { path: "/freelancer-dashboard", element: <FreelancerDashboard /> },
    ],
  },
];

export default routes;
