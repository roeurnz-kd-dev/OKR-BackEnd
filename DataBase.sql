-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: yamanote.proxy.rlwy.net:12583
-- Generation Time: Sep 09, 2025 at 09:21 AM
-- Server version: 9.4.0
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `railway`
--

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`) VALUES
(1, 'Sales'),
(3, 'marketing'),
(12, 'Human Resources'),
(13, 'Finance'),
(14, 'Operations');

-- --------------------------------------------------------

--
-- Table structure for table `department_kpis`
--

CREATE TABLE `department_kpis` (
  `id` int NOT NULL,
  `kpi_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department_kpis`
--

INSERT INTO `department_kpis` (`id`, `kpi_id`, `department_id`) VALUES
(9, 9, 2),
(11, 9, 13),
(12, 13, 12),
(13, 16, 12);

-- --------------------------------------------------------

--
-- Table structure for table `followups`
--

CREATE TABLE `followups` (
  `id` int NOT NULL,
  `deal_id` int DEFAULT NULL,
  `lead_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `due_date` datetime DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `priority` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `followups`
--

INSERT INTO `followups` (`id`, `deal_id`, `lead_id`, `user_id`, `description`, `due_date`, `status`, `created_at`, `updated_at`, `priority`) VALUES
(10, NULL, 6, NULL, '\"end quotation,” “Urgent meeting”', '2025-09-12 15:00:00', 'In Progress', NULL, NULL, 'High'),
(11, NULL, 6, NULL, 'urgent basic work and meting due ', '2025-09-19 15:00:00', 'Completed', NULL, NULL, 'Medium'),
(12, NULL, 5, NULL, 'this meting is very important in client deal ', '2025-09-20 15:00:00', 'Upcoming', NULL, NULL, 'Medium'),
(13, NULL, 5, NULL, 'new task upload and there are some minor change in the deal  you can keep it ', '2025-09-25 15:00:00', 'Upcoming', NULL, NULL, 'Low');

-- --------------------------------------------------------

--
-- Table structure for table `individual_kpis`
--

CREATE TABLE `individual_kpis` (
  `id` int NOT NULL,
  `kpi_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `individual_kpis`
--

INSERT INTO `individual_kpis` (`id`, `kpi_id`, `user_id`) VALUES
(10, 13, 7),
(11, 14, 17),
(12, 17, 7),
(14, 21, 18);

-- --------------------------------------------------------

--
-- Table structure for table `key_results`
--

CREATE TABLE `key_results` (
  `id` int NOT NULL,
  `okr_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `progress` int DEFAULT NULL,
  `image` varchar(500) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `key_results`
--

INSERT INTO `key_results` (`id`, `okr_id`, `title`, `progress`, `image`) VALUES
(209, 98, 'Integrate AI chatbot', 80, 'https://res.cloudinary.com/dflse5uml/image/upload/v1756126214/company_okrs/px4ebx2fq5wjtymi8tss.jpg'),
(210, 98, 'Hire 5 support agents', 30, 'https://res.cloudinary.com/dflse5uml/image/upload/v1756126212/company_okrs/ulukm8vmcompld2knaev.jpg'),
(257, 116, 'Close 20 new enterprise deals', 68, NULL),
(258, 116, 'Increase average deal size by 15%', 66, NULL),
(259, 117, 'Close 20 new enterprise deals', 100, NULL),
(260, 117, 'Increase average deal size by 15%', 100, NULL),
(261, 118, 'close 20 deals per day', 60, NULL),
(262, 119, 'new customer data collerct', 60, NULL),
(263, 119, 'new customer lead', 81, NULL),
(265, 121, 'Customer can improve your skill', 70, NULL),
(266, 121, 'improve your performance ', 60, NULL),
(267, 122, 'followers increase in daily ', 66, NULL),
(268, 122, 'linkdin study daily basic ', 77, NULL),
(269, 123, 'increase one followers ', 72, NULL),
(270, 123, 'increase two followers ', 90, NULL),
(278, 129, 'Nisi aut ut ut quos ', 60, 'https://res.cloudinary.com/dfporfl8y/image/upload/v1757391588/company_okrs/k3e7fymhz3rryosfe67w.jpg'),
(279, 130, '123', 42, 'https://res.cloudinary.com/dfporfl8y/image/upload/v1757391631/company_okrs/vrijxzv51adezgkxglkk.jpg'),
(280, 131, 'Est ex rerum consequ', 60, 'https://res.cloudinary.com/dfporfl8y/image/upload/v1757391740/company_okrs/d2l57g4qdfnzwnorlgkd.jpg'),
(281, 132, '22', 90, 'https://res.cloudinary.com/dfporfl8y/image/upload/v1757391863/company_okrs/sf1h3hf7bbsdad3uyueb.jpg'),
(282, 133, '2000', 100, 'https://res.cloudinary.com/dfporfl8y/image/upload/v1757393339/department_okrs/hcrqqh3weejxbpy8lh0j.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `kpis`
--

CREATE TABLE `kpis` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `target_value` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `frequency` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `progress` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `kpis`
--

INSERT INTO `kpis` (`id`, `title`, `target_value`, `frequency`, `description`, `department_id`, `user_id`, `progress`, `created_at`, `updated_at`) VALUES
(16, 'Increase Linkdin Followers', '90', 'Weekly', 'Increase Linkdin Followers Increase Linkdin Followers Increase Linkdin Followers Increase Linkdin Followers', NULL, NULL, 94, '2025-09-03 11:21:22', '2025-09-09 04:56:34'),
(17, 'Increase Instagram Followers', '89', 'Yearly', 'Increase Instagram Followers Increase Instagram Followers', NULL, NULL, 78, '2025-09-03 11:21:50', '2025-09-03 12:01:12'),
(20, 'KPI1', '100', 'Weekly', 'Autem rerum placeat', NULL, NULL, 84, '2025-09-09 04:54:23', '2025-09-09 04:55:04'),
(21, 'Customer satisfaction ', '100', 'Monthly', 'kpi', NULL, NULL, 74, '2025-09-09 04:58:02', '2025-09-09 06:28:45');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `company` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `lead_source` varchar(155) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` varchar(155) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `owner` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `leads`
--

INSERT INTO `leads` (`id`, `name`, `company`, `email`, `phone`, `lead_source`, `status`, `notes`, `owner`, `created_at`, `updated_at`) VALUES
(4, 'jhon', 'jhonpvt', 'jhon@gmail.com', '04545454555', 'LinkedIn', 'Contacted', 'deal', 7, '2025-08-22 06:03:38', '2025-09-03 07:40:21'),
(5, 'jhon', 'Acme Corporation', 'jhon@gmail.com', '04545454555', 'LinkedIn', 'Qualified', 'Interested in our premium subscription plan. Follow up next week.', 7, '2025-08-25 14:26:10', '2025-08-25 14:26:10'),
(6, 'Alice Johnson', 'Tech Solutions Ltd.', 'Johnson@gmail.com', '04545454555', 'LinkedIn', 'Qualified', 'Interested in our premium subscription plan. Follow up next week.', 7, '2025-08-25 14:26:37', '2025-09-02 10:09:06'),
(7, 'Alice Johnson', 'Tech Solutions Ltd.', 'Johnson@gmail.com', '04545454555', 'LinkedIn', 'Qualified', 'Interested in our premium subscription plan. Follow up next week.', 7, '2025-08-25 14:26:37', '2025-08-25 14:26:37'),
(8, 'Emily Davis', 'Creative Labs', 'emily.davis@creativelabs.com', '04545454555', 'Referral', 'Contacted', 'Interested in enterprise package.', 17, '2025-09-02 10:15:24', '2025-09-02 10:27:23'),
(9, 'David Wilson', 'NextGen Solutions', 'david.wilson@nextgen.com', '04545454555', 'Cold Call', 'Qualified', 'Schedule a demo call', 17, '2025-09-02 10:17:02', '2025-09-02 10:17:13'),
(10, 'Sophia Lee', 'Global Tech', 'sophia.lee@globaltech.com', '04545454555', 'Event', 'Qualified', 'Potential large client', 17, '2025-09-02 10:19:37', '2025-09-02 10:19:37'),
(13, 'demo ', 'Global Innovations', 'demo@gmail.com', '04545454555', 'LinkedIn', 'New', 'testing', 7, '2025-09-03 07:46:42', '2025-09-03 07:46:42');

-- --------------------------------------------------------

--
-- Table structure for table `okrs`
--

CREATE TABLE `okrs` (
  `id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `type` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `target_quarter` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `progress` int DEFAULT '0',
  `owner_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `department_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `okrs`
--

INSERT INTO `okrs` (`id`, `title`, `description`, `type`, `target_quarter`, `progress`, `owner_id`, `created_by`, `created_at`, `department_id`) VALUES
(98, 'Improve Customer Support', 'Reduce response time', 'individual', 'Q1 2025', 0, 17, 1, '2025-08-25 12:50:11', 3),
(116, 'Increase Department Sales ', 'Focus on new sales channels', 'individual', 'Q3-2025', 0, 7, 1, '2025-09-02 06:23:04', NULL),
(117, 'Increase Department Sales ', 'Focus on new sales channels', 'individual', 'Q3-2025', 0, 7, 1, '2025-09-02 06:23:04', NULL),
(118, 'increase linkden followers', NULL, 'department', 'Q2 2025 (Apr – Jun)', 0, 17, 1, '2025-09-02 11:27:47', 12),
(119, 'grow Customer  review', NULL, 'department', 'Q2 2025 (Apr – Jun)', 0, 17, 1, '2025-09-02 11:30:36', 12),
(121, 'Increase Customer Performance ', 'Increase Customer Performance Increase Customer Performance ', 'company', 'Q2 2025 (Apr – Jun)', 0, 17, 1, '2025-09-02 11:45:22', NULL),
(122, 'Linkdin Followers Improve', 'Linkdin Followers Improve Linkdin Followers Improve', 'company', 'Q1 2025 (Jan – Mar)', 0, 9, 1, '2025-09-02 11:46:57', NULL),
(123, 'increase linkdin followers', NULL, 'department', 'Q2 2025 (Apr – Jun)', 0, 17, 1, '2025-09-02 13:58:32', 14),
(129, 'Sunt nemo praesenti', 'Iure ea fugiat est d', 'company', 'Q2 2025 (Apr – Jun)', 0, 17, 1, '2025-09-09 04:19:48', NULL),
(130, '123', '123', 'company', 'Q4 2025 (Oct – Dec)', 0, 18, 1, '2025-09-09 04:20:30', NULL),
(131, 'Aliquid omnis quis q', 'Officia autem culpa', 'company', 'Q4 2025 (Oct – Dec)', 0, 18, 1, '2025-09-09 04:22:19', NULL),
(132, '499', 'Goods', 'company', 'Q4 2025 (Oct – Dec)', 0, 18, 1, '2025-09-09 04:24:22', NULL),
(133, 'Sales 2000', NULL, 'department', 'Q4 2025 (Oct – Dec)', 0, 18, 1, '2025-09-09 04:48:58', 1);

-- --------------------------------------------------------

--
-- Table structure for table `okr_dependencies`
--

CREATE TABLE `okr_dependencies` (
  `id` int NOT NULL,
  `okr_id` int DEFAULT NULL,
  `department_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `priority` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `okr_dependencies`
--

INSERT INTO `okr_dependencies` (`id`, `okr_id`, `department_id`, `created_by`, `created_at`, `priority`) VALUES
(4, 43, 2, 1, '2025-08-23 12:38:27', NULL),
(5, 43, 2, 1, '2025-08-23 12:39:41', NULL),
(6, 53, 4, 1, '2025-08-25 11:12:10', 'high'),
(10, 62, 12, 1, '2025-09-02 10:46:54', 'high'),
(11, 24, 13, 1, '2025-09-02 10:48:10', 'medium'),
(12, 121, 12, 1, '2025-09-04 05:54:36', 'high');

-- --------------------------------------------------------

--
-- Table structure for table `okr_dependency_tasks`
--

CREATE TABLE `okr_dependency_tasks` (
  `id` int NOT NULL,
  `dependency_id` int DEFAULT NULL,
  `task` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `okr_dependency_tasks`
--

INSERT INTO `okr_dependency_tasks` (`id`, `dependency_id`, `task`) VALUES
(4, 2, 'Collect metrics from sales team'),
(5, 2, 'Prepare quarterly review report'),
(6, 2, 'Schedule OKR alignment meeting'),
(7, 3, 'Collect metrics from sales team'),
(8, 3, 'Schedule OKR alignment meeting'),
(9, 3, 'Prepare quarterly review report'),
(10, 4, 'increser data'),
(11, 4, 'increase data'),
(12, 5, 'sas'),
(13, 6, 'followers '),
(14, 7, 'head'),
(15, 8, 'gfgfg'),
(16, 9, 'and grow up'),
(17, 9, 'Increase followers'),
(18, 10, 'Generate 100 lead in 14 day'),
(19, 10, 'convert new lead'),
(20, 11, 'make a new methode for customer '),
(21, 11, 'calling new customer for new data '),
(22, 12, 'increase followers');

-- --------------------------------------------------------

--
-- Table structure for table `opportunities`
--

CREATE TABLE `opportunities` (
  `id` int NOT NULL,
  `lead_id` int DEFAULT NULL,
  `company` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deal_value` decimal(15,2) DEFAULT NULL,
  `probability` int DEFAULT NULL,
  `stage` varchar(155) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `owner` int DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expected_close_date` date DEFAULT NULL,
  `lead_name` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `opportunities`
--

INSERT INTO `opportunities` (`id`, `lead_id`, `company`, `deal_value`, `probability`, `stage`, `owner`, `created_at`, `updated_at`, `expected_close_date`, `lead_name`) VALUES
(11, 6, NULL, 5000.00, 50, 'Qualification', NULL, '2025-09-02 09:52:25', '2025-09-02 09:58:58', '2025-09-12', NULL),
(12, 7, NULL, 23000.00, 70, 'Meeting', NULL, '2025-09-02 10:13:19', '2025-09-02 12:05:07', '2025-09-20', NULL),
(13, 5, NULL, 4000.00, 58, 'Closing', NULL, '2025-09-02 10:13:43', '2025-09-02 12:01:14', '2025-09-20', NULL),
(14, 9, NULL, 2300.00, 67, 'Proposal', NULL, '2025-09-02 10:17:41', '2025-09-03 09:06:04', '2025-09-27', NULL),
(15, 10, NULL, 5600.00, 89, 'Qualification', NULL, '2025-09-02 10:20:04', '2025-09-02 12:05:20', '2025-09-20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `report_type` varchar(100) NOT NULL,
  `report` text NOT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `name`, `report_type`, `report`, `tags`, `created_at`, `updated_at`) VALUES
(1, 'Weekly Sales Report', 'Weekly', 'https://res.cloudinary.com/dfporfl8y/image/upload/v1756811044/reports/1756811042270-children-report%20%282%29.pdf', 'Sales  , Weekly', '2025-09-02 11:04:05', '2025-09-02 11:04:05');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `role` varchar(100) COLLATE utf8mb4_general_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(150) COLLATE utf8mb4_general_ci DEFAULT 'user',
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `active_status` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `resetToken` text COLLATE utf8mb4_general_ci,
  `resetTokenExpiry` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `password`, `active_status`, `created_at`, `updated_at`, `resetToken`, `resetTokenExpiry`) VALUES
(5, 'Admin Doe', 'admin@gmail.com', 'admin', '$2b$10$fc5VvGSaFMfoEKxz7g82bu/dkWU44/MAG2u8XrM/F3ut1ol1LFD.2', 1, '2025-08-20 10:27:23', '2025-09-09 02:02:10', '47614f67bb76c176017ea35a603783440903795a8a06e2b2b3e852378384ea5f', '2025-09-02 10:26:40.885'),
(9, 'jhon', 'jhon1@gmail.com', 'user', '$2b$10$LMiopRKa5uicNVa4aUtT9.VZaUAyHpDmS0NL4EhkJMNQSAVCLgZkK', 1, '2025-08-20 10:44:23', '2025-08-20 10:44:23', NULL, NULL),
(17, 'michel', 'michel@gmail.com', 'user', '$2b$10$ibgW8KpKr8.jPjAakiT.jupt26djf.hOQr9pYu2aF/fXdMSoUMdLi', 1, '2025-08-21 07:32:48', '2025-08-21 07:32:48', NULL, NULL),
(18, 'kim ', 'kimsudara123@gmail.com', 'user', '$2b$10$lWLHGw56hbxLHvIqTMcKHOqWBT9lOa.ZskUDz.EwSfEKx001uScsG', 1, '2025-08-29 02:01:28', '2025-08-29 02:01:28', NULL, NULL),
(19, 'roeurnz', 'roeurnkaki@gmail.com', 'user', '$2b$10$m4wn90/86GfVOzx1ehB/Me0QuXRWVkwJLtGA7welQKMhg.8ZEi.tu', 1, '2025-09-09 02:24:21', '2025-09-09 02:24:21', NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `department_kpis`
--
ALTER TABLE `department_kpis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `followups`
--
ALTER TABLE `followups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `individual_kpis`
--
ALTER TABLE `individual_kpis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `key_results`
--
ALTER TABLE `key_results`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `kpis`
--
ALTER TABLE `kpis`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `okrs`
--
ALTER TABLE `okrs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `okr_dependencies`
--
ALTER TABLE `okr_dependencies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `okr_dependency_tasks`
--
ALTER TABLE `okr_dependency_tasks`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `opportunities`
--
ALTER TABLE `opportunities`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `department_kpis`
--
ALTER TABLE `department_kpis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `followups`
--
ALTER TABLE `followups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `individual_kpis`
--
ALTER TABLE `individual_kpis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `key_results`
--
ALTER TABLE `key_results`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=283;

--
-- AUTO_INCREMENT for table `kpis`
--
ALTER TABLE `kpis`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `okrs`
--
ALTER TABLE `okrs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=134;

--
-- AUTO_INCREMENT for table `okr_dependencies`
--
ALTER TABLE `okr_dependencies`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `okr_dependency_tasks`
--
ALTER TABLE `okr_dependency_tasks`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `opportunities`
--
ALTER TABLE `opportunities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
