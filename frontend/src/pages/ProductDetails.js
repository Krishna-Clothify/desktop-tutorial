import { Navigate, useParams } from "react-router-dom";

export default function ProductDetails() {
  const { id } = useParams();
  return <Navigate to={`/cloth/${id}`} replace />;
}
