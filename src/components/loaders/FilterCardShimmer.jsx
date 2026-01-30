import React from "react";
import ContentLoader from "react-content-loader";

const FilterCardShimmer = () => (
  <div className="row mb-4 animate__animated animate__fadeInUp animate__faster">
    <div className="col-12">
      <div className="card border-0 shadow-sm animate__animated animate__fadeInUp animate__faster" style={{ borderRadius: "12px" }}>
        <div className="card-body p-3">
          <ContentLoader
            speed={1.2}
            width="100%"
            height={300}
            backgroundColor="#f3f3f3"
            foregroundColor="#e0e0e0"
            style={{ width: "100%" }}
          >
            {/* Title */}
            <rect x="0" y="10" rx="4" ry="4" width="150" height="20" />

            {/* Search Bar */}
            <rect x="0" y="50" rx="6" ry="6" width="100%" height="38" />

            {/* Location Section Title */}
            <rect x="0" y="110" rx="4" ry="4" width="120" height="18" />

            {/* Location Filters Row */}
            <rect x="0" y="145" rx="6" ry="6" width="48%" height="36" />
            <rect x="52%" y="145" rx="6" ry="6" width="48%" height="36" />

            {/* Course Details Section Title */}
            <rect x="0" y="200" rx="4" ry="4" width="140" height="18" />

            {/* Course Filters Row */}
            <rect x="0" y="235" rx="6" ry="6" width="48%" height="36" />
            <rect x="52%" y="235" rx="6" ry="6" width="48%" height="36" />

            {/* Reset Button */}
            <rect x="0" y="290" rx="6" ry="6" width="100%" height="36" />
          </ContentLoader>
        </div>
      </div>
    </div>
  </div>
);

export default FilterCardShimmer;
