-- ============================================================================
-- Actualización de URLs de imágenes locales para las 20 herramientas
-- Utiliza los archivos descargados y normalizados en frontend/public/images/tools/
-- ============================================================================

UPDATE tools SET main_image_url = 'images/tools/HERR-0001.jpg' WHERE id = 1;
UPDATE tools SET main_image_url = 'images/tools/HERR-0002.jpg' WHERE id = 2;
UPDATE tools SET main_image_url = 'images/tools/HERR-0003.jpg' WHERE id = 3;
UPDATE tools SET main_image_url = 'images/tools/HERR-0004.jpg' WHERE id = 4;
UPDATE tools SET main_image_url = 'images/tools/HERR-0005.webp' WHERE id = 5;
UPDATE tools SET main_image_url = 'images/tools/HERR-0006.jpg' WHERE id = 6;
UPDATE tools SET main_image_url = 'images/tools/HERR-0007.webp' WHERE id = 7;
UPDATE tools SET main_image_url = 'images/tools/HERR-0008.webp' WHERE id = 8;
UPDATE tools SET main_image_url = 'images/tools/HERR-0009.jpg' WHERE id = 9;
UPDATE tools SET main_image_url = 'images/tools/HERR-0010.jpg' WHERE id = 10;
UPDATE tools SET main_image_url = 'images/tools/HERR-0011.jpg' WHERE id = 11;
UPDATE tools SET main_image_url = 'images/tools/HERR-0012.jpg' WHERE id = 12;
UPDATE tools SET main_image_url = 'images/tools/HERR-0013.webp' WHERE id = 13;
UPDATE tools SET main_image_url = 'images/tools/HERR-0014.jpg' WHERE id = 14;
UPDATE tools SET main_image_url = 'images/tools/HERR-0015.jpg' WHERE id = 15;
UPDATE tools SET main_image_url = 'images/tools/HERR-0016.jpg' WHERE id = 16;
UPDATE tools SET main_image_url = 'images/tools/HERR-0017.jpg' WHERE id = 17;
UPDATE tools SET main_image_url = 'images/tools/HERR-0018.webp' WHERE id = 18;
UPDATE tools SET main_image_url = 'images/tools/HERR-0019.jpg' WHERE id = 19;
UPDATE tools SET main_image_url = 'images/tools/HERR-0020.jpg' WHERE id = 20;

-- Actualización de la galería secundaria tool_images (4FN)
DELETE FROM tool_images;
INSERT INTO tool_images (tool_id, image_url, is_primary, caption)
SELECT id, main_image_url, TRUE, 'Vista principal del equipo' FROM tools;

INSERT INTO tool_images (tool_id, image_url, is_primary, caption) VALUES
(1, 'images/tools/taladro-percutor.webp', FALSE, 'Vista en operación con broca SDS'),
(3, 'images/tools/HERR-0003.png', FALSE, 'Detalle de estructura y crucetas'),
(11, 'images/tools/HERR-0011.png', FALSE, 'Vista en trípode de precisión'),
(14, 'images/tools/HERR-0014.png', FALSE, 'Vista de manguera y lanza');
