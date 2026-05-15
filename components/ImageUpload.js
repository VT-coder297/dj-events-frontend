import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '@/config/index';
import styles from '@/styles/Form.module.css';

export default function ImageUpload({ evtId, imageUploaded, token }) {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Enforce strict front-end validation guard clause
    if (!image) {
      toast.error('Please select an image file first.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('files', image);
    formData.append('ref', 'api::event.event'); // Strapi content-type system UID blueprint
    formData.append('refId', String(evtId)); // MUST receive numeric ID (e.g. 28) for valid database relation linking
    formData.append('field', 'image'); // Maps directly to the target media field name inside collection

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Leverages active user authentication scopes
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Image synchronized and updated successfully!');
        setImage(null); // Clear selected file reference upon execution success
        imageUploaded(); // Refresh parent view framework parameters
      } else {
        const errMsg =
          data.error?.message ||
          'Check Strapi collection upload permission rules';
        toast.error(errMsg);
      }
    } catch (err) {
      toast.error(
        'A severe transmission network fault occurred during upload.',
      );
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  return (
    <div className={styles.form}>
      <h1>Upload Event Image</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.file}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>
        <input
          type="submit"
          value={uploading ? 'Uploading...' : 'Upload'}
          className="btn"
          disabled={uploading || !image}
        />
      </form>
    </div>
  );
}
