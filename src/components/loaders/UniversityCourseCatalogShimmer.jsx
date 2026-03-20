import React from "react";
import ContentLoader from "react-content-loader";

const UniversityCourseCatalogShimmer = ({ count = 3 }) => (
  <div className="row g-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="col-md-6 col-lg-4">
        <div className="card h-100 border-0 shadow-sm animate__animated animate__fadeInUp animate__faster">
          <div className="card-body">
            <ContentLoader
              speed={1.2}
              width="100%"
              height={400}
              backgroundColor="#f3f3f3"
              foregroundColor="#e0e0e0"
              style={{ width: "100%", marginBottom: "12px" }}
            >
              {/* Course Title */}
              <rect x="0" y="10" rx="4" ry="4" width="100%" height="20" />
              <rect x="0" y="35" rx="4" ry="4" width="80%" height="16" />

              {/* University Name */}
              <rect x="0" y="65" rx="4" ry="4" width="90%" height="14" />

              {/* Country */}
              <rect x="0" y="85" rx="4" ry="4" width="75%" height="14" />

              {/* Intake Badge */}
              <rect x="0" y="110" rx="4" ry="4" width="40%" height="20" />

              {/* Tuition */}
              <rect x="0" y="140" rx="4" ry="4" width="100%" height="16" />

              {/* Duration */}
              <rect x="0" y="165" rx="4" ry="4" width="85%" height="16" />

              {/* Scholarship Section */}
              <rect x="0" y="195" rx="6" ry="6" width="100%" height="50" />

              {/* View Details Button */}
              <rect x="0" y="260" rx="6" ry="6" width="100%" height="36" />
            </ContentLoader>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default UniversityCourseCatalogShimmer;
