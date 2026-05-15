import Link from 'next/link';
import { FaPencilAlt, FaTimes } from 'react-icons/fa';
import styles from '@/styles/DashboardEvent.module.css';

export default function DashboardEvent({ evt, handleDelete }) {
  return (
    <div className={styles.event}>
      <h4>
        {/* Fixed: Removed duplicate legacy <a> wrapper */}
        <Link href={`/events/${evt.slug}`}>{evt.name}</Link>
      </h4>

      {/* Fixed: Swapped out 'evt.id' for the modern Strapi v5 'evt.documentId' hash variable */}
      <Link href={`/events/edit/${evt.documentId}`} className={styles.edit}>
        <FaPencilAlt /> <span>Edit Event</span>
      </Link>

      <button
        type="button"
        className={styles.delete}
        // Fixed: Pass documentId to delete handler and use e.preventDefault inside standard handlers
        onClick={(e) => {
          e.preventDefault();
          handleDelete(evt.documentId);
        }}
      >
        <FaTimes /> <span>Delete</span>
      </button>
    </div>
  );
}
