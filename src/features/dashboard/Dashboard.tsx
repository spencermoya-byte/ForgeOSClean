import React from "react";
import useUser from '../../hooks/useUser';

const Dashboard: React.FC = () => {
  const { data: user, isLoading, isError } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading user</div>;

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome, {user.name}!</p>
    </div>
  );
};

export default Dashboard;
