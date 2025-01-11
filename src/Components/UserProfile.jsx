import '../css/ComponentsCss/UserProfile.css';
const UserProfile = () => {

  //**********add dinamic user db 
  /*
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="profile-container">
        <p className="profile-info">You are not logged in.</p>
        <button className="profile-button" onClick={handleLoginRedirect}>
          Go to Login
        </button>
      </div>
    );
  }*/

    //***********add dinamic user information
    return (
      <div className="profile-container">
        <h2>My Profile</h2>

        {/*user.photo && (
          <img
            src={user.photo}
            alt="User Profile"
            className="profile-image"
          />
        )*/}

        <p className="profile-info">
          <strong>ID:</strong> {/*user.id*/}
        </p>
        <p className="profile-info">
          <strong>Name:</strong> {/*user.name*/}
        </p>
        <p className="profile-info">
          <strong>Email:</strong> {/*user.email*/}
        </p>
        {/* Add more user details as needed */}
        <button>Logout</button>
        <button>Print Summary</button>
        
      </div>
    );
  };

export default UserProfile;
