import { useState, useEffect } from "react";
import clinic360Api from "./api";

export const usePatients = (params = {}) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchPatients = async (searchParams = params) => {
    setLoading(true);
    try {
      const response = await clinic360Api.getPatients(searchParams);
      if (response.data.status === 8000) {
        setPatients(response.data.data.results || response.data.data);
        setPagination(response.data.data.pagination || null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return { patients, loading, error, pagination, refetch: fetchPatients };
};

export const useVisits = (params = {}) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchVisits = async (searchParams = params) => {
    setLoading(true);
    try {
      const response = await clinic360Api.getVisits(searchParams);
      if (response.data.status === 8000) {
        setVisits(response.data.data.results || response.data.data);
        setPagination(response.data.data.pagination || null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  return { visits, loading, error, pagination, refetch: fetchVisits };
};

export const useQueueEntries = (params = {}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchEntries = async (searchParams = params) => {
    setLoading(true);
    try {
      const response = await clinic360Api.getQueueEntries(searchParams);
      if (response.data.status === 8000) {
        setEntries(response.data.data.results || response.data.data);
        setPagination(response.data.data.pagination || null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return { entries, loading, error, pagination, refetch: fetchEntries };
};

export const useInsurancePolicies = (params = {}) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  const fetchPolicies = async (searchParams = params) => {
    setLoading(true);
    try {
      const response = await clinic360Api.getInsurancePolicies(searchParams);
      if (response.data.status === 8000) {
        setPolicies(response.data.data.results || response.data.data);
        setPagination(response.data.data.pagination || null);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  return { policies, loading, error, pagination, refetch: fetchPolicies };
};

export default clinic360Api;
