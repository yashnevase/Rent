CREATE DATABASE  IF NOT EXISTS `rent` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `rent`;
-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: rent
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agreement`
--

DROP TABLE IF EXISTS `agreement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agreement` (
  `agreement_id` int NOT NULL AUTO_INCREMENT,
  `agreement_no` varchar(45) DEFAULT NULL,
  `property_id` int DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `tenent_id` int DEFAULT NULL,
  `agreement_image` longtext,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `rent_amount` decimal(8,2) DEFAULT NULL,
  `deposit_amount` decimal(8,2) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`agreement_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agreement`
--

LOCK TABLES `agreement` WRITE;
/*!40000 ALTER TABLE `agreement` DISABLE KEYS */;
INSERT INTO `agreement` VALUES (1,'A123',1,1,2,'http://192.168.29.228:5000/uploads/1755339066855-logo.jfif','2025-01-01','2025-09-15',3000.00,12000.00,0,0,1,'2025-08-16 10:11:06');
/*!40000 ALTER TABLE `agreement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `owner` (
  `owner_id` int NOT NULL AUTO_INCREMENT,
  `owner_name` varchar(45) DEFAULT NULL,
  `owner_details` varchar(45) DEFAULT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `owner_image` longtext,
  PRIMARY KEY (`owner_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `owner`
--

LOCK TABLES `owner` WRITE;
/*!40000 ALTER TABLE `owner` DISABLE KEYS */;
INSERT INTO `owner` VALUES (1,'Y raj','',0,NULL);
/*!40000 ALTER TABLE `owner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `agreement_id` int DEFAULT NULL,
  `tenent_id` int DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `payment_date` datetime DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '0: due, 1: paid, 2: failed',
  `method` varchar(45) DEFAULT NULL,
  `transaction_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paymentss`
--

DROP TABLE IF EXISTS `paymentss`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `paymentss` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `agreement_id` int DEFAULT NULL,
  `tenent_id` int DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `amount_paid` decimal(2,0) DEFAULT NULL,
  `payment_date` datetime NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `method` varchar(45) DEFAULT NULL,
  `ss_upload` longtext,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paymentss`
--

LOCK TABLES `paymentss` WRITE;
/*!40000 ALTER TABLE `paymentss` DISABLE KEYS */;
/*!40000 ALTER TABLE `paymentss` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `property`
--

DROP TABLE IF EXISTS `property`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `property` (
  `property_id` int NOT NULL AUTO_INCREMENT,
  `property_name` varchar(45) DEFAULT NULL,
  `property_details` varchar(45) DEFAULT NULL,
  `property_images` longtext,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `occupied` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`property_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `property`
--

LOCK TABLES `property` WRITE;
/*!40000 ALTER TABLE `property` DISABLE KEYS */;
INSERT INTO `property` VALUES (1,'1bhk ','1bhk ground floor ','[\"http://192.168.29.228:5000/uploads/1755342383402-Black Gold Elegant Minimalist Certificate Of Achievement A4 (1).png\",\"http://192.168.29.228:5000/uploads/1755342383412-logoabs.png\",\"http://192.168.29.228:5000/uploads/1755342383419-logo.jfif\",\"http://192.168.29.228:5000/uploads/1755342383421-jj.jpg\"]',0,1,NULL,1),(2,'test','test','[\"http://192.168.29.228:5000/uploads/1755334090321-jj.jpg\"]',1,1,'2025-08-16 08:41:17',0);
/*!40000 ALTER TABLE `property` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenent`
--

DROP TABLE IF EXISTS `tenent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tenent` (
  `tenent_id` int NOT NULL AUTO_INCREMENT,
  `tenent_name` varchar(45) DEFAULT NULL,
  `tenent_details` varchar(45) DEFAULT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `tenent_image` longtext,
  `occupied` tinyint NOT NULL DEFAULT '0',
  `email_id` varchar(455) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`tenent_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenent`
--

LOCK TABLES `tenent` WRITE;
/*!40000 ALTER TABLE `tenent` DISABLE KEYS */;
INSERT INTO `tenent` VALUES (1,'tenent1','tenent 1 deatils ',0,'http://192.168.29.228:5000/uploads/1755354534820-jj.jpg',0,'tenant@gmailcom',NULL,NULL),(2,'tenent2','tenent 2 details ',0,NULL,1,NULL,NULL,NULL),(3,'tenant3','ntntntsfsdfsdfsdf',0,'http://192.168.29.228:5000/uploads/1755354577001-1755339066855-logo (3).jfif',0,'dfsd',1,'2025-08-16 19:59:37'),(4,'teanant 5','dsfsdf',0,'http://192.168.29.228:5000/uploads/1755354617961-template.png',0,'dsfsdfsdf',1,'2025-08-16 20:00:17');
/*!40000 ALTER TABLE `tenent` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `users_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) DEFAULT NULL,
  `password` longtext,
  `role` varchar(45) DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `full_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`users_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Yraj','$2a$10$b67TEw9fEwLBfzM/zMEtEeyO/I2Jzfp0xwTiGGXetdCa6fdXDPr56','owner',1,'Y raj');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-16 20:59:49
