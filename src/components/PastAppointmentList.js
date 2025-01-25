import { useEffect, useState } from "react";
import { getAppointment } from "../services/AppointmentService";
import PastAppointment from "./PastAppointment";
import styles from "./PastAppointmentList.module.css";

const PastAppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const loggedUser = JSON.parse(localStorage.getItem("logged_user"));
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 3;
  const [autoSlide, setAutoSlide] = useState(null);

  const nextSlide = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % appointments.length);
    resetAutoSlide();
  };

  const prevSlide = () => {
    setStartIndex(
      (prevIndex) => (prevIndex - 1 + appointments.length) % appointments.length
    );
    resetAutoSlide();
  };

  const resetAutoSlide = () => {
    if (autoSlide) clearInterval(autoSlide);
    const interval = setInterval(() => {
      setStartIndex((prevIndex) => (prevIndex + 1) % appointments.length);
    }, 10000);
    setAutoSlide(interval);
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const allAppointments = await getAppointment();
        const today = new Date();

        const PastAppointments = allAppointments
          .filter((appointment) => {
            const appointmentDate = parseDate(appointment.date);
            return (
              appointment.userId === loggedUser.userId &&
              appointmentDate &&
              appointmentDate < today
            );
          })
          .sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            if (dateA.getTime() !== dateB.getTime()) {
              return dateA - dateB;
            }
            return a.startTime.localeCompare(b.startTime);
          });

        setAppointments(PastAppointments);
        if (PastAppointments.length > 1) {
          resetAutoSlide();
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, [loggedUser.userId]);

  useEffect(() => {
    return () => {
      if (autoSlide) clearInterval(autoSlide);
    };
  }, [autoSlide]);

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Upcoming Appointments</h2>
      {appointments.length > 0 ? (
        <div className={styles.appointmentsWrapper}>
          <button
            onClick={prevSlide}
            className={`${styles.navButton} ${styles.prevButton}`}
          >
            <img src="image/prev.svg"></img>
          </button>
          {appointments
            .slice(startIndex, startIndex + visibleCount)
            .concat(
              appointments.slice(
                0,
                Math.max(0, startIndex + visibleCount - appointments.length)
              )
            )
            .map((appointment) => (
              <PastAppointment
                key={appointment.appId}
                appointment={appointment}
                className={styles.appointmentCard}
              />
            ))}
          <button
            onClick={nextSlide}
            className={`${styles.navButton} ${styles.nextButton}`}
          >
            <img src="image/next.svg"></img>
          </button>
        </div>
      ) : (
        <p className={styles.noAppointments}>No Past appointments found.</p>
      )}
    </div>
  );
};

export default PastAppointmentList;
