-- Actualización de URLs de imágenes reales para las 20 herramientas
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Milwaukee_PLH28XE.JPG?width=800' WHERE id = 1;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Concrete_mixer.jpg?width=800' WHERE id = 2;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Andamio_de_tres_cuerpos_de_Aneur.jpg?width=800' WHERE id = 3;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kolbenkompressor.jpg?width=800' WHERE id = 4;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Honda_EU3000is_Inverter_Generator.jpg?width=800' WHERE id = 5;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Circular_saw.jpg?width=800' WHERE id = 6;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Welding_Machine_001.jpg?width=800' WHERE id = 7;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Concretevibrator.jpg?width=800' WHERE id = 8;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wacker_Neuson_Stampfer_BS_60-2i.jpg?width=800' WHERE id = 9;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Scissor_Lift-2.jpg?width=800' WHERE id = 10;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Total_station_made_by_Leica_Geosystems.jpg?width=800' WHERE id = 11;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lombardini_Motori_LDA_673_pic4.jpg?width=800' WHERE id = 12;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AngleGrinder.jpg?width=800' WHERE id = 13;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/KARCHER_5_85.jpg?width=800' WHERE id = 14;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Extension_ladder_leaning_against_a_garage.JPG?width=800' WHERE id = 15;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AbbruchhammerSAH1500-HK.jpg?width=800' WHERE id = 16;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/BobcatS770SkidSteerLoader.jpg?width=800' WHERE id = 17;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hand_tools.jpg?width=800' WHERE id = 18;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/AirCombi_Hockdruck.JPG?width=800' WHERE id = 19;
UPDATE tools SET main_image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/SMC_TL90_mobile_lighting_tower._Brightlights,_Battlesbridge._(7657791926).jpg?width=800' WHERE id = 20;

-- Actualización de la galería tool_images
DELETE FROM tool_images;
INSERT INTO tool_images (tool_id, image_url, is_primary, caption)
SELECT id, main_image_url, TRUE, 'Vista principal del equipo' FROM tools;

INSERT INTO tool_images (tool_id, image_url, is_primary, caption) VALUES
(1, 'https://commons.wikimedia.org/wiki/Special:FilePath/Hitachi_DH24PE_loaded.jpg?width=800', FALSE, 'Vista en operación con broca SDS'),
(9, 'https://commons.wikimedia.org/wiki/Special:FilePath/Trilstamper.jpg?width=800', FALSE, 'Detalle del pie de impacto'),
(13, 'https://commons.wikimedia.org/wiki/Special:FilePath/Winkelschleifer.jpg?width=800', FALSE, 'Detalle con disco de desbaste'),
(14, 'https://commons.wikimedia.org/wiki/Special:FilePath/Kaercher_hochdruckreiniger.jpg?width=800', FALSE, 'Vista de manguera y lanza'),
(15, 'https://commons.wikimedia.org/wiki/Special:FilePath/Step-ladder.JPG?width=800', FALSE, 'Vista en posición desplegada'),
(16, 'https://commons.wikimedia.org/wiki/Special:FilePath/Jackhammer.jpg?width=800', FALSE, 'Operación en obra'),
(17, 'https://commons.wikimedia.org/wiki/Special:FilePath/Bobcat_553.jpg?width=800', FALSE, 'Vista lateral del minicargador');
