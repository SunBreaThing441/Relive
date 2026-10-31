import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import connectDB from "./db.js";
import User from "../models/User.model.js";
import Admin from "../models/Admin.model.js";
import Doner from "../models/Doner.model.js";
import Recipient from "../models/Recipient.model.js";
import Organ from "../models/Organ.model.js";
import DonerRequest from "../models/DonerRequest.model.js";
import RecipientRequest from "../models/RecipientRequest.model.js";
import Match from "../models/Match.model.js";

/**
 * Migrate and seed the database with sample data suitable for running the frontend.
 * @param {Object} options Configuration options
 * @param {boolean} options.dropExisting Whether to clean previous collections before seeding
 * @returns {Promise<Object>} Summary of seeded data
 */
export async function migrateDatabase(options = { dropExisting: true }) {
    console.log("=================================================");
    console.log("🚀 Starting Organ Matching Database Migration...");
    console.log("=================================================");

    if (mongoose.connection.readyState === 0) {
        await connectDB();
    }

    if (options.dropExisting) {
        console.log("🧹 Clearing existing collections...");
        await Promise.all([
            Match.deleteMany({}),
            DonerRequest.deleteMany({}),
            RecipientRequest.deleteMany({}),
            Doner.deleteMany({}),
            Recipient.deleteMany({}),
            Admin.deleteMany({}),
            Organ.deleteMany({}),
            User.deleteMany({})
        ]);
        console.log("✅ Collections cleared.");
    }

    // -------------------------------------------------------------------------
    // 1. Create Users
    // -------------------------------------------------------------------------
    console.log("👤 Creating Users...");
    const defaultPassword = "password123";

    // Admins
    const userAdmin = await User.create({
        fullName: "Dr. Arvind Mehta",
        email: "admin@organdonation.org",
        password: defaultPassword
    });

    const userHospital = await User.create({
        fullName: "Dr. Shalini Kapoor",
        email: "hospital@aiims.org",
        password: defaultPassword
    });

    // Donors
    const userDonor1 = await User.create({
        fullName: "Rahul Sharma",
        email: "rahul.donor@gmail.com",
        password: defaultPassword
    });

    const userDonor2 = await User.create({
        fullName: "Priya Patel",
        email: "priya.donor@gmail.com",
        password: defaultPassword
    });

    const userDonor3 = await User.create({
        fullName: "Amit Verma",
        email: "amit.donor@gmail.com",
        password: defaultPassword
    });

    const userDonor4 = await User.create({
        fullName: "Sneha Reddy",
        email: "sneha.donor@gmail.com",
        password: defaultPassword
    });

    // Recipients
    const userPatient1 = await User.create({
        fullName: "Vikram Singh",
        email: "vikram.patient@gmail.com",
        password: defaultPassword
    });

    const userPatient2 = await User.create({
        fullName: "Ananya Sen",
        email: "ananya.patient@gmail.com",
        password: defaultPassword
    });

    const userPatient3 = await User.create({
        fullName: "Rajesh Kumar",
        email: "rajesh.patient@gmail.com",
        password: defaultPassword
    });

    const userPatient4 = await User.create({
        fullName: "Kavita Nair",
        email: "kavita.patient@gmail.com",
        password: defaultPassword
    });

    console.log(`✅ Created 10 users.`);

    // -------------------------------------------------------------------------
    // 2. Create Admin Profiles
    // -------------------------------------------------------------------------
    console.log("🛡️ Creating Admin Profiles...");
    const adminHashedPass = await bcrypt.hash("admin123", 10);
    const hospitalHashedPass = await bcrypt.hash("hospital123", 10);

    const admin1 = await Admin.create({
        user: userAdmin._id,
        role: "admin",
        gender: "male",
        userName: "admin",
        password: adminHashedPass,
        contactInfo: {
            phone: "+91 9876543210",
            address: "National Organ & Tissue Transplant Organisation (NOTTO), New Delhi"
        },
        location: "New Delhi"
    });

    const admin2 = await Admin.create({
        user: userHospital._id,
        role: "hospital",
        gender: "female",
        userName: "hospital",
        password: hospitalHashedPass,
        contactInfo: {
            phone: "+91 9876543211",
            address: "AIIMS Department of Transplant Surgery, New Delhi"
        },
        location: "New Delhi"
    });

    console.log(`✅ Created 2 admins.`);

    // -------------------------------------------------------------------------
    // 3. Create Organs
    // -------------------------------------------------------------------------
    console.log("🫀 Creating Organ Categories...");
    const organTypes = ["kidney", "liver", "heart", "lung", "cornea", "pancreas", "intestine"];
    const organs = {};
    for (const type of organTypes) {
        organs[type] = await Organ.create({ type });
    }
    console.log(`✅ Created ${organTypes.length} organ records.`);

    // -------------------------------------------------------------------------
    // 4. Create Donor Profiles
    // -------------------------------------------------------------------------
    console.log("🤝 Creating Donor Profiles...");
    const donorRahul = await Doner.create({
        user: userDonor1._id,
        age: 28,
        weight: "70",
        height: "175",
        gender: "male",
        bloodGroup: "O+",
        contactInfo: {
            phone: "+91 9123456701",
            address: "Flat 402, Green Park, New Delhi"
        },
        isVerified: true,
        location: "New Delhi"
    });

    // Perfectly matches Ananya Sen for automatic matching cron demonstration
    const donorPriya = await Doner.create({
        user: userDonor2._id,
        age: 32,
        weight: "62",
        height: "165",
        gender: "female",
        bloodGroup: "A+",
        contactInfo: {
            phone: "+91 9123456702",
            address: "14 Marine Drive, Mumbai"
        },
        isVerified: true,
        location: "Mumbai"
    });

    const donorAmit = await Doner.create({
        user: userDonor3._id,
        age: 45,
        weight: "78",
        height: "180",
        gender: "male",
        bloodGroup: "B+",
        contactInfo: {
            phone: "+91 9123456703",
            address: "88 Indiranagar, Bangalore"
        },
        isVerified: true,
        location: "Bangalore"
    });

    const donorSneha = await Doner.create({
        user: userDonor4._id,
        age: 24,
        weight: "55",
        height: "160",
        gender: "female",
        bloodGroup: "AB+",
        contactInfo: {
            phone: "+91 9123456704",
            address: "21 Jubilee Hills, Hyderabad"
        },
        isVerified: false, // For testing pending verification flow
        location: "Hyderabad"
    });

    console.log(`✅ Created 4 donor profiles.`);

    // -------------------------------------------------------------------------
    // 5. Create Recipient (Patient) Profiles
    // -------------------------------------------------------------------------
    console.log("🏥 Creating Recipient Profiles...");
    const recipientVikram = await Recipient.create({
        user: userPatient1._id,
        age: 28,
        weight: "70",
        height: "175",
        gender: "male",
        bloodGroup: "O+",
        contactInfo: {
            phone: "+91 9988776601",
            address: "Sector 14, Rohini, New Delhi"
        },
        isVerified: true,
        location: "New Delhi"
    });

    // Matches Priya Patel
    const recipientAnanya = await Recipient.create({
        user: userPatient2._id,
        age: 32,
        weight: "62",
        height: "165",
        gender: "female",
        bloodGroup: "A+",
        contactInfo: {
            phone: "+91 9988776602",
            address: "Block CF, Salt Lake, Kolkata"
        },
        isVerified: true,
        location: "Kolkata"
    });

    const recipientRajesh = await Recipient.create({
        user: userPatient3._id,
        age: 50,
        weight: "82",
        height: "172",
        gender: "male",
        bloodGroup: "B+",
        contactInfo: {
            phone: "+91 9988776603",
            address: "10 Usman Road, T. Nagar, Chennai"
        },
        isVerified: true,
        location: "Chennai"
    });

    const recipientKavita = await Recipient.create({
        user: userPatient4._id,
        age: 29,
        weight: "58",
        height: "162",
        gender: "female",
        bloodGroup: "AB-",
        contactInfo: {
            phone: "+91 9988776604",
            address: "7 Fort Kochi, Kochi"
        },
        isVerified: true,
        location: "Kochi"
    });

    console.log(`✅ Created 4 recipient profiles.`);

    // -------------------------------------------------------------------------
    // 6. Create Donor Requests
    // -------------------------------------------------------------------------
    console.log("📋 Creating Donor Requests...");
    const reqDonor1 = await DonerRequest.create({
        organType: organs["kidney"]._id,
        bloodGroup: "O+",
        doner: donorRahul._id,
        admin: admin1._id,
        adminConfirmation: "fulfilled",
        status: "matched"
    });

    // Pending matching with Ananya Sen
    const reqDonor2 = await DonerRequest.create({
        organType: organs["liver"]._id,
        bloodGroup: "A+",
        doner: donorPriya._id,
        admin: admin1._id,
        adminConfirmation: "fulfilled",
        status: "pending"
    });

    const reqDonor3 = await DonerRequest.create({
        organType: organs["heart"]._id,
        bloodGroup: "B+",
        doner: donorAmit._id,
        admin: admin2._id,
        adminConfirmation: "fulfilled",
        status: "pending"
    });

    const reqDonor4 = await DonerRequest.create({
        organType: organs["cornea"]._id,
        bloodGroup: "AB+",
        doner: donorSneha._id,
        admin: admin1._id,
        adminConfirmation: "pending", // Pending admin review
        status: "pending"
    });

    console.log(`✅ Created 4 donor requests.`);

    // -------------------------------------------------------------------------
    // 7. Create Recipient Requests
    // -------------------------------------------------------------------------
    console.log("📋 Creating Recipient Requests...");
    const reqRecipient1 = await RecipientRequest.create({
        organType: organs["kidney"]._id,
        bloodGroup: "O+",
        urgencyLevel: "critical",
        recipient: recipientVikram._id,
        admin: admin1._id,
        adminConfirmation: "fulfilled",
        status: "matched"
    });

    // Pending match with Priya Patel
    const reqRecipient2 = await RecipientRequest.create({
        organType: organs["liver"]._id,
        bloodGroup: "A+",
        urgencyLevel: "high",
        recipient: recipientAnanya._id,
        admin: admin1._id,
        adminConfirmation: "fulfilled",
        status: "pending"
    });

    const reqRecipient3 = await RecipientRequest.create({
        organType: organs["heart"]._id,
        bloodGroup: "B+",
        urgencyLevel: "critical",
        recipient: recipientRajesh._id,
        admin: admin2._id,
        adminConfirmation: "fulfilled",
        status: "pending"
    });

    const reqRecipient4 = await RecipientRequest.create({
        organType: organs["lung"]._id,
        bloodGroup: "AB-",
        urgencyLevel: "medium",
        recipient: recipientKavita._id,
        admin: admin1._id,
        adminConfirmation: "pending",
        status: "pending"
    });

    console.log(`✅ Created 4 recipient requests.`);

    // -------------------------------------------------------------------------
    // 8. Create Sample Matches
    // -------------------------------------------------------------------------
    console.log("🎯 Creating Sample Matches...");
    const match1 = await Match.create({
        organ: organs["kidney"]._id,
        donor: donorRahul._id,
        donorRequest: reqDonor1._id,
        recipient: recipientVikram._id,
        recipientRequest: reqRecipient1._id,
        admin: admin1._id,
        status: "approved"
    });

    console.log(`✅ Created 1 active approved match.`);

    console.log("=================================================");
    console.log("🎉 Database migration completed successfully!");
    console.log("=================================================");

    const summary = {
        usersCount: 10,
        adminsCount: 2,
        organsCount: organTypes.length,
        donorsCount: 4,
        recipientsCount: 4,
        donorRequestsCount: 4,
        recipientRequestsCount: 4,
        matchesCount: 1,
        testAccounts: {
            admin: {
                username: "admin",
                email: "admin@organdonation.org",
                password: "admin123"
            },
            hospitalAdmin: {
                username: "hospital",
                email: "hospital@aiims.org",
                password: "hospital123"
            },
            donors: [
                { name: "Rahul Sharma", email: "rahul.donor@gmail.com", password: "password123", organ: "Kidney (O+)", status: "Matched" },
                { name: "Priya Patel", email: "priya.donor@gmail.com", password: "password123", organ: "Liver (A+)", status: "Ready for Auto-match" },
                { name: "Amit Verma", email: "amit.donor@gmail.com", password: "password123", organ: "Heart (B+)", status: "Pending" },
                { name: "Sneha Reddy", email: "sneha.donor@gmail.com", password: "password123", organ: "Cornea (AB+)", status: "Pending Verification" }
            ],
            recipients: [
                { name: "Vikram Singh", email: "vikram.patient@gmail.com", password: "password123", organ: "Kidney (O+)", urgency: "critical", status: "Matched" },
                { name: "Ananya Sen", email: "ananya.patient@gmail.com", password: "password123", organ: "Liver (A+)", urgency: "high", status: "Ready for Auto-match" },
                { name: "Rajesh Kumar", email: "rajesh.patient@gmail.com", password: "password123", organ: "Heart (B+)", urgency: "critical", status: "Pending" },
                { name: "Kavita Nair", email: "kavita.patient@gmail.com", password: "password123", organ: "Lung (AB-)", urgency: "medium", status: "Pending Review" }
            ]
        }
    };

    return summary;
}

// Allow direct execution via CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    migrateDatabase()
        .then((summary) => {
            console.log("\nSample Credentials for Frontend Testing:");
            console.table([
                { Role: "System Admin", Username: summary.testAccounts.admin.username, Email: summary.testAccounts.admin.email, Password: summary.testAccounts.admin.password },
                { Role: "Hospital Admin", Username: summary.testAccounts.hospitalAdmin.username, Email: summary.testAccounts.hospitalAdmin.email, Password: summary.testAccounts.hospitalAdmin.password },
                { Role: "Donor (Matched)", Username: "-", Email: summary.testAccounts.donors[0].email, Password: summary.testAccounts.donors[0].password },
                { Role: "Donor (Ready to match)", Username: "-", Email: summary.testAccounts.donors[1].email, Password: summary.testAccounts.donors[1].password },
                { Role: "Recipient (Matched)", Username: "-", Email: summary.testAccounts.recipients[0].email, Password: summary.testAccounts.recipients[0].password },
                { Role: "Recipient (Ready to match)", Username: "-", Email: summary.testAccounts.recipients[1].email, Password: summary.testAccounts.recipients[1].password }
            ]);
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ Migration failed:", err);
            process.exit(1);
        });
}
