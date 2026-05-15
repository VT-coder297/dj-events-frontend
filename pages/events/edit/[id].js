import { FaImage } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import Layout from '@/components/Layout';
import Modal from '@/components/Modal';
import ImageUpload from '@/components/ImageUpload';
import { API_URL } from '@/config/index';
import cookie from 'cookie';
import styles from '@/styles/Form.module.css';

export default function EditEventPage({ evt, token }) {
  if (!evt) {
    return (
      <Layout title="Not Found">
        <div
          className="container"
          style={{ textAlign: 'center', marginTop: '40px' }}
        >
          <h3>Event not found</h3>
          <Link href="/events">Go Back</Link>
        </div>
      </Layout>
    );
  }

  // FIXED FOR STRAPI V5 Array vs Object Structures
  const initialImage =
    Array.isArray(evt.image) && evt.image.length > 0
      ? evt.image[0]?.formats?.thumbnail?.url || evt.image[0]?.url
      : evt.image?.formats?.thumbnail?.url || evt.image?.url || null;

  const [values, setValues] = useState({
    name: evt.name || '',
    performers: evt.performers || '',
    venue: evt.venue || '',
    address: evt.address || '',
    date: evt.date ? evt.date.split('T')[0] : '',
    time: evt.time || '',
    description: evt.description?.[0]?.children?.[0]?.text || '',
  });

  const [imagePreview, setImagePreview] = useState(initialImage);

  // 1. FIXED: Store the underlying structural Strapi database file reference object state tracking parameters
  const [currentImageRef, setCurrentImageRef] = useState(evt.image || null);

  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasEmptyFields = Object.values(values).some(
      (element) => element === '',
    );
    if (hasEmptyFields) {
      toast.error('Please fill in all fields');
      return;
    }

    const { description, ...formFields } = values;

    // 2. FIXED: Construct dynamic parameters incorporating the image relation link properties safely
    const payload = {
      ...formFields,
      description: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: description }],
        },
      ],
      // Tells Strapi v5 to maintain or connect the exact active database asset link references
      image: currentImageRef,
    };

    const res = await fetch(`${API_URL}/api/events/${evt.documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: payload }),
    });

    const json = await res.json();

    if (!res.ok) {
      toast.error(json.error?.message || 'Something Went Wrong');
    } else {
      router.push(`/events/${json.data.slug}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const imageUploaded = async () => {
    const res = await fetch(
      `${API_URL}/api/events/${evt.documentId}?populate=*`,
    );
    const json = await res.json();

    const freshImage = json.data?.image;

    // 3. FIXED: Maintain absolute raw structural updates right inside reference tracking records
    setCurrentImageRef(freshImage || null);

    const imageUrl =
      Array.isArray(freshImage) && freshImage.length > 0
        ? freshImage[0]?.formats?.thumbnail?.url || freshImage[0]?.url
        : freshImage?.formats?.thumbnail?.url || freshImage?.url;

    setImagePreview(imageUrl || null);
    setShowModal(false);
  };

  return (
    <Layout title="Edit Event">
      <Link href="/events">Go Back</Link>
      <h1>Edit Event</h1>
      <ToastContainer />
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={values.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="performers">Performers</label>
            <input
              type="text"
              name="performers"
              id="performers"
              value={values.performers}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="venue">Venue</label>
            <input
              type="text"
              name="venue"
              id="venue"
              value={values.venue}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              id="address"
              value={values.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              id="date"
              value={values.date}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="time">Time</label>
            <input
              type="text"
              name="time"
              id="time"
              value={values.time}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description">Event Description</label>
          <textarea
            name="description"
            id="description"
            value={values.description}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <input type="submit" value="Update Event" className="btn" />
      </form>

      <h2>Event Image</h2>
      {imagePreview ? (
        <Image
          src={imagePreview}
          height={100}
          width={170}
          alt={values.name}
          priority
        />
      ) : (
        <div>
          <p>No image uploaded</p>
        </div>
      )}

      <div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-secondary btn-icon"
        >
          <FaImage /> Set Image
        </button>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <ImageUpload
          evtId={evt.id}
          imageUploaded={imageUploaded}
          token={token}
        />
      </Modal>
    </Layout>
  );
}

export async function getServerSideProps({ query, req }) {
  const identifier = query.id || query.slug;

  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token || null;

  try {
    const res = await fetch(`${API_URL}/api/events/${identifier}?populate=*`);
    const json = await res.json();

    return {
      props: {
        evt: json.data || null,
        token,
      },
    };
  } catch (err) {
    console.error('Failed to fetch event server side:', err);
    return {
      props: {
        evt: null,
        token: null,
      },
    };
  }
}
