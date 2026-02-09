import { useDispatch, useSelector } from "react-redux";
import getGreetingMessage from "../utils/greetingHandler";
import { logout } from "../redux/actions/authentication/logoutAction";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";

const Navbar = ({ isService = false }) => {
  const user = useSelector((state) => state.userReducer?.data);

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Dispatch custom event for sidebar toggle
    const event = new CustomEvent('toggleSidebar', { detail: { open: !sidebarOpen } });
    document.dispatchEvent(event);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  return (
    <nav
      className="layout-navbar navbar-detached navbar navbar-expand-xl align-items-center bg-navbar-theme container-fluid"
      id="layout-navbar"
      style={{ position: 'sticky', top: 0, zIndex: 1000 }}
    >


      <div className="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
        <button
          aria-label="toggle for sidebar"
          className="nav-item nav-link px-0 me-xl-4 bg-transparent border-0"
          onClick={toggleSidebar}
          type="button"
        >
          <i className="bx bx-menu bx-sm"></i>
        </button>
      </div>

      <div
        className="navbar-nav-right d-flex align-items-center"
        id="navbar-collapse"
      >
        {isService ? (
          getGreetingMessage(user ? user.first_name : "")
        ) : (
          <span className="text-secondary text-truncate">
            <i className="bx bx-user me-1 mb-1"></i>
            {user ? `${user.first_name} ${user.last_name}` : ""}
          </span>
        )}


        <ul className="navbar-nav flex-row align-items-center ms-auto">
          {user && user.position && (
            <li className="nav-item">
              <button
                aria-label="Click me"
                type="button"
                className="btn btn-sm btn-outline-secondary me-2 me-xl-4"
                style={{ color: '#475569', borderColor: '#cbd5e1' }}
              >
                <i className="bx bx-user me-1"></i>
                {user?.position?.level_name}
              </button>
            </li>
          )}

          <li className="nav-item ">
            <a
              aria-label="go to notifications"
              className="nav-link px-0 me-2 me-xl-4"
              href="#"
            >
              <i className="bx bx-bell bx-sm"></i>
            </a>
          </li>
          <li className="nav-item navbar-dropdown dropdown-user dropdown">
            <button
              aria-label="dropdown profile avatar"
              className="nav-link dropdown-toggle hide-arrow bg-transparent border-0"
              onClick={toggleProfileDropdown}
              type="button"
            >
              <div className="avatar avatar-online">
                <img
                  src={
                    user && user.photo && user.photo.trim() !== ""
                      ? user.photo
                      : "/assets/img/avatars/1.png"
                  }
                  style={{ width: "40px", height: "40px" }}
                  className="w-px-40 rounded-circle"
                  alt="avatar-image"
                  aria-label="Avatar Image"
                />
              </div>
            </button>
            <ul className={`dropdown-menu dropdown-menu-end ${showProfileDropdown ? "show" : ""}`} style={{ 
              display: showProfileDropdown ? "block" : "none",
              position: "absolute",
              right: 0,
              top: "100%",
              minWidth: "200px",
              zIndex: 1050
            }}>
              <li>
                <a
                  aria-label="go to profile"
                  className="dropdown-item"
                  href="#"
                >
                  <div className="d-flex">
                    <div className="flex-shrink-0 me-3">
                      <div className="avatar avatar-online">
                        <img
                          src={
                            user && user.photo && user.photo.trim() !== ""
                              ? user.photo
                              : "/assets/img/avatars/1.png"
                          }
                          style={{ width: "40px", height: "40px" }}
                          className="w-px-40  rounded-circle"
                          alt="avatar-image"
                          aria-label="Avatar Image"
                        />
                      </div>
                    </div>
                    <div className="flex-grow-1">
                      <span className="fw-medium d-block">
                        {user
                          ? user.first_name + " " + user.last_name
                          : "Guest"}
                      </span>
                      <small className="text-muted">
                        {user ? user.is_admin : "Member"}
                      </small>
                    </div>
                  </div>
                </a>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
              <li>
                <span
                  aria-label="go to profile"
                  className="dropdown-item cursor-pointer"
                  href="#"
                  onClick={() => {
                    navigate("/account/settings");
                    setShowProfileDropdown(false);
                  }}
                >
                  <i className="bx bx-user me-2"></i>
                  <span className="align-middle">My Profile</span>
                </span>
              </li>
              <li>
                <a
                  aria-label="go to setting"
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowProfileDropdown(false);
                    handleLogout();
                  }}
                >
                  <i className="bx bx-lock me-2"></i>
                  <span className="align-middle">Log Out</span>
                </a>
              </li>
              <li>
                <div className="dropdown-divider"></div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
};
export default Navbar;

