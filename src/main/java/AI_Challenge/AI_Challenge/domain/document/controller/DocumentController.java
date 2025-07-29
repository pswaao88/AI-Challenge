package AI_Challenge.AI_Challenge.domain.document.controller;

import AI_Challenge.AI_Challenge.domain.document.dto.MarkdownRequestDTO;
import AI_Challenge.AI_Challenge.domain.document.service.DocumentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/document")
@Slf4j
public class DocumentController {
    
    private final DocumentService documentService;
    
    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }
    
    @PostMapping("/convert")
    public ResponseEntity<byte[]> convertMarkdownToDocx(@RequestBody MarkdownRequestDTO request) {
        try {
            byte[] docxBytes = documentService.convertMarkdownToDocx(request.getMarkdownContent());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            headers.setContentDisposition(ContentDisposition.builder("attachment")
                    .filename("converted.docx")
                    .build());
            
            return new ResponseEntity<>(docxBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("문서 변환 중 오류 발생", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
