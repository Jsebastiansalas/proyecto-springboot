package com.renta.application.port.in;

import com.renta.application.dto.tool.CategoryResponse;
import com.renta.application.dto.tool.ToolDetailResponse;
import com.renta.application.dto.tool.ToolResponse;

import java.util.List;

public interface ToolQueryUseCase {

    List<ToolResponse> listAvailableTools();

    List<ToolResponse> listToolsByCategory(Integer categoryId);

    List<ToolResponse> listToolsByProvider(Long providerId);

    ToolDetailResponse getToolDetail(Long toolId);

    List<CategoryResponse> listCategories();

    List<ToolResponse> searchTools(String query, Integer categoryId, Double minPrice, Double maxPrice);
}
