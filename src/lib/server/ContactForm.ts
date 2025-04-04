import { model, Schema } from "mongoose";

interface IContactForm {
  name: string;
  email: string;
  message: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

const contactForm = new Schema<IContactForm>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const ContactForm = model<IContactForm>("ContactForm", contactForm, "contactData", { overwriteModels: false });

export default ContactForm;
