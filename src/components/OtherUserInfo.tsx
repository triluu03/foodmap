import { useParams } from "react-router-dom";

function OtherUserInfo() {
  const { id } = useParams();
  console.log("User ID: ", id);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Information</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">User profile details coming soon...</p>
      </div>
    </div>
  );
}

export default OtherUserInfo;
