package AI_Challenge.AI_Challenge.domain.document.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DocumentRequestDto {
    private String originalFileName;
    private String fileType;
}
